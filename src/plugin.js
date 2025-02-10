const { plugin, logger, pluginPath, resourcesPath } = require("flexdesigner")
const path = require('path')
const { createCanvas } = require('@napi-rs/canvas');

const keyData = {}
var feedbackKeys = []

async function testAPIs()
{
    logger.info('Test plugin API calls')
    logger.info('showSnackbarMessage', await plugin.showSnackbarMessage('info', 'Hello from plugin!'))
    logger.info('getAppInfo', await plugin.getAppInfo())
    logger.info('setConfig', await plugin.setConfig({ test: 'Hello' }))
    logger.info('getConfig', await plugin.getConfig())
    logger.info('saveFile', await plugin.saveFile(path.resolve(pluginPath, 'test.txt'), 'Hello world!!!'))
    logger.info('openFile', await plugin.openFile(path.resolve(pluginPath, 'test.txt')))
    logger.info('getOpenedWindows', await plugin.getOpenedWindows())
    logger.info('getDeviceStatus', await plugin.getDeviceStatus())
    logger.info('dialog.showOpenDialog', await plugin.electronAPI('dialog.showOpenDialog', { properties: ["openDirectory"] }))
    logger.info('dialog.showSaveDialog', await plugin.electronAPI('dialog.showSaveDialog', { properties: ["openFile"] }))
    logger.info('dialog.showMessageBox', await plugin.electronAPI('dialog.showMessageBox', { type: "info", message: "Hello from plugin!" }))
    logger.info('dialog.showErrorBox', await plugin.electronAPI('dialog.showErrorBox', "Error", "This is an error message"))
    logger.info('app.getAppPath', await plugin.electronAPI('app.getAppPath'))
    logger.info('app.getPath', await plugin.electronAPI('app.getPath', "temp"))
    logger.info('screen.getCursorScreenPoint', await plugin.electronAPI('screen.getCursorScreenPoint'))
    logger.info('screen.getPrimaryDisplay', await plugin.electronAPI('screen.getPrimaryDisplay'))
    logger.info('screen.getAllDisplays', await plugin.electronAPI('screen.getAllDisplays'))
}

logger.info(`Plugin path: ${pluginPath}`)
logger.info(`Plugin Resources path: ${resourcesPath}`)

/**
 * Called when current active window changes
 * {
  "status": "changed",
  "oldWin": {
    "platform": "windows",
    "id": 13568630,
    "title": "Flexbar Designer - New Project*",
    "owner": {
      "processId": 16664,
      "path": Path to executable,
      "name": "Electron"
    },
    "bounds": {
      "x": 748,
      "y": 170,
      "width": 2171,
      "height": 1291
    },
    "memoryUsage": 229281792
  },
  "newWin": {
    "platform": "windows",
    "id": 2820094,
    "title": "apitest.vue - FlexDesigner-SDK - Visual Studio Code",
    "owner": {
      "processId": 7892,
      "path": Path to executable,
      "name": "Visual Studio Code"
    },
    "bounds": {
      "x": 0,
      "y": 0,
      "width": 1280,
      "height": 1528
    },
    "memoryUsage": 151236608
  }
}
 */
plugin.on('system.actwin', (payload) => {
    logger.info('Active window changed:', payload)
})

/**
 * Called when received message from UI send by this.$fd.sendToBackend
 * @param {object} payload message sent from UI
 */
plugin.on('ui.message', async (payload) => {
    logger.info('Received message from UI:', payload)
    if (payload.data === 'test') {
        await testAPIs()
        return 'Done!'
    }
    else {
        return 'Hello from plugin backend!'
    }
})

/**
 * Called when device status changes
 * @param {object} data device status data
 * [
 *  {
 *    serialNumber: '',
 *    deviceData: {
 *       platform: '',
 *       profileVersion: '',
 *       firmwareVersion: '',
 *       deviceName: '',
 *       displayName: ''
 *    }
 *  }
 * ]
 */
plugin.on('device.status', (data) => {
    logger.info('Device status changed:', data)
})

/**
 * Called when a plugin key is loaded
 * @param {Object} payload alive key data
 * {
 *  serialNumber: '',
 *  keys: [
 *  {
 *      "data": {},
 *      "cid": "com.eniac.test.wheel",
 *      "bg": 0,
 *      "width": 360,
 *      "pluginID": "com.eniac.test",
 *      "typeOverride": "plugin",
 *      "wheel": {
 *      "step": 5
 *      },
 *      "cfg": {
 *      "keyType": "wheel",
 *      "sendKey": true
 *      },
 *      "uid": 0,
 *      "sz": 2309
 *  }
 *  ]
 * }
 */
plugin.on('plugin.alive', (payload) => {
    logger.info('Plugin alive:', payload)
    const data = payload.keys
    const serialNumber = payload.serialNumber
    feedbackKeys = []
    for (let key of data) {
        keyData[key.uid] = key
        if (key.cid === 'com.eniac.test.counter') {
            keyData[key.uid].counter = parseInt(key.data.rangeMin)
            key.style.showIcon = false
            key.style.showTitle = true
            key.title = 'Click Me!'
            plugin.draw(serialNumber, key, 'draw')
        }
        else if (key.cid === 'com.eniac.test.slider') {
            plugin.set(serialNumber, key, {
                value: 50
            })
        }
        else if (key.cid === 'com.eniac.test.cyclebutton') {
            logger.debug('Setting state to 3')
            plugin.set(serialNumber, key, {
                state: 3
            })
        }
        else if (key.cid === 'com.eniac.test.apitest') {
            feedbackKeys.push(key)
        }
    }
})


/**
 * Called when user interacts with a key
 * @param {object} payload key data 
 * {
 *  serialNumber, 
 *  data
 * }
 */
plugin.on('plugin.data', (payload) => {
    logger.info('Received plugin.data:', payload)
    const data = payload.data
    const serialNumber = payload.serialNumber
    if (data.key.cid === "com.eniac.test.cyclebutton") {
        return {
            "status": "success",
            "message": `Last state: ${data.state}`
        }
    }
    else if (data.key.cid === "com.eniac.test.counter") {
        const key = data.key
        key.style.showIcon = false
        key.style.showTitle = true
        keyData[key.uid].counter++
        if (keyData[key.uid].counter > parseInt(key.data.rangeMax)) {
            keyData[key.uid].counter = parseInt(key.data.rangeMin)
        }
        key.title = `${keyData[key.uid].counter}`
        plugin.draw(serialNumber, key, 'draw')
    } 
    else if (data.key.cid === 'com.eniac.test.wheel') {
      for (let key of feedbackKeys) {
          const bg = generateRainbowCanvas(key.width, `${data.state} ${data.delta || "0"}`)
          plugin.draw(serialNumber, key, 'base64', bg)
        }
    }
})

// Connect to flexdesigner and start the plugin
plugin.start()

/**
 * @brief Generates a PNG base64 string with a rainbow gradient and a centered number.
 *
 * Detailed description:
 * This function creates a canvas using @napi-rs/canvas with the specified width and a fixed height of 60 pixels.
 * It draws a rainbow gradient background across the canvas and then draws the number '0' in the center.
 * Finally, the canvas is converted into a PNG base64 string that includes the MIME type.
 *
 * @param {number} width - The width of the canvas.
 * @param {number} value - The number to be drawn in the center of the canvas.
 * @return {string} The PNG base64 string with MIME type.
 */
function generateRainbowCanvas(width, value) {
    const height = 60;
    // Create a canvas with the specified dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
  
    // Create a linear gradient from left to right for the rainbow effect
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0.0, 'red');
    gradient.addColorStop(0.16, 'orange');
    gradient.addColorStop(0.33, 'yellow');
    gradient.addColorStop(0.50, 'green');
    gradient.addColorStop(0.66, 'blue');
    gradient.addColorStop(0.83, 'indigo');
    gradient.addColorStop(1.0, 'violet');
  
    // Fill the canvas with the rainbow gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  
    // Set the font and text properties
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Draw text shadow
    ctx.fillStyle = 'black';
    ctx.fillText(value, width / 2 + 2, height / 2 + 2);
    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(value, width / 2, height / 2);
  
    // Convert the canvas to a PNG base64 string with MIME type
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  }