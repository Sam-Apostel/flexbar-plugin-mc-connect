const winston = require('winston');
var cachedLogger = null;
const osName = require('os').platform();
function processPathSpaces(input) {
    if (osName == 'win32') {
        return input.replace(/\\/g, '/').split('/').map(subStr => {
            return subStr.includes(' ') ? `"${subStr}"` : subStr;
        }).join('/');
    }
    return input.replace(/\\/g, '/');
}

function initLogger() {
    let alignColorsAndTime = winston.format.combine(
        winston.format.colorize({
            all:true
        }),
        winston.format.label({
            label:'> LOG'
        }),
        winston.format.timestamp({
            format:"YY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(
            info => `${info.label} ${info.timestamp} ${info.level}-> ${info.message}`
        )
    );
    
    winston.addColors({
        info: 'bold cyan',
        warn: 'yellowBG bold white',
        error: 'redBG bold white',
        debug: 'green',
    });
    function formatMessage(args) {
        return args.map(arg => {
            if (arg instanceof Error) {
                return `${arg.message}\n${arg.stack}`;
            }
            if (arg instanceof Uint8Array) {
                return `Uint8Array [ ${Array.from(arg).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')} ]`;
            }
            if (typeof arg === 'object' && arg !== null) {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');
    }
    
    const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        transports: [
        ]
    });
    
    logger.add(new (winston.transports.Console)({
        format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
    }));
    
    ['info', 'warn', 'error', 'debug'].forEach(level => {
        const original = logger[level];
        logger[level] = (...args) => {
            const formattedMessage = formatMessage(args);
            original.call(logger, formattedMessage);
        };
    });
  
    return logger;
}

module.exports = {
    logger: cachedLogger || (cachedLogger = initLogger())
};

