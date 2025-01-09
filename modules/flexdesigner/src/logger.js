const winston = require('winston');
// const DailyRotateFile = require('winston-daily-rotate-file');
// import path from 'path';
// import fs from 'fs';
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

// const logDir = path.join(app.getPath('userData'), 'logs')
// if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir, { recursive: true });
// }

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
    
    // 格式化日志消息
    function formatMessage(args) {
        return args.map(arg => {
            if (arg instanceof Error) {
                // 处理 Error 类型，输出错误信息和堆栈
                return `${arg.message}\n${arg.stack}`;
            }
            if (arg instanceof Uint8Array) {
                // 处理 Uint8Array 类型，输出为十六进制格式
                return `Uint8Array [ ${Array.from(arg).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')} ]`;
            }
            if (typeof arg === 'object' && arg !== null) {
                // 对象或数组转换为 JSON 字符串
                return JSON.stringify(arg, null, 2);
            }
            // 其他类型直接返回字符串
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
            // new DailyRotateFile({
            //     filename: '%DATE%.log',
            //     dirname: processPathSpaces(logDir),
            //     datePattern: 'YYYY-MM-DD',
            //     zippedArchive: true,
            //     maxSize: '20m',
            //     maxFiles: '14d'
            // })
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

// console.log = (message, ...args) => logger.info(message, ...args);
// console.info = (message, ...args) => logger.info(message, ...args);
// console.error = (message, ...args) => logger.error(message, ...args);
// console.warn = (message, ...args) => logger.warn(message, ...args);

