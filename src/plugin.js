const { plugin, logger, pluginPath, resourcesPath } = require("flexdesigner")
const path = require('path')

logger.warn(pluginPath, resourcesPath)

plugin.on('ui.message', (payload) => {
    console.log('Received message from UI:', payload)
    return 'Hello from plugin backend!'
})

plugin.on('device.init', (data) => {
    console.log('Received device.init:', data)
})

plugin.on('device.status', (data) => {
    console.log('Received device.status:', data)
})

plugin.on('plugin.alive', (data) => {
    console.log('Received plugin.alive:', data)
    for (let key of data) {
        if (key.cid === 'com.eniac.test.screenshot') {
            key.style.showIcon = false
            key.style.showTitle = true
            key.title = 'Click Me!'
            plugin.draw(key, 'draw')
        }
        else if (key.cid === 'com.eniac.test.slider') {
            plugin.set(key, {
                value: 50
            })
        }
    }
})


var counter = 1
var cycleKey = null
plugin.on('plugin.data', (data) => {
    console.log('Received plugin.data:', data)
    if (data.key.cid === "com.eniac.test.cyclebutton") {
        cycleKey = data.key
        return {
            "status": "error",
            "message": "This is an error message"
        }
    }
    else if (data.key.cid === "com.eniac.test.screenshot") {
        const key = data.key
        key.style.showIcon = false
        key.style.showTitle = true
        key.title = `${counter++}`
        plugin.draw(key, 'draw')
    }
})

plugin.start()

// setTimeout(async () => {
//     logger.info('Test plugin API calls')
//     logger.info('showSnackbarMessage', await plugin.showSnackbarMessage('info', 'Hello from plugin!'))
//     logger.info('getAppInfo', await plugin.getAppInfo())
//     logger.info('saveFile', await plugin.saveFile(path.resolve(pluginPath, 'test.txt'), 'Hello world!!!'))
//     logger.info('openFile', await plugin.openFile(path.resolve(pluginPath, 'test.txt')))
//     logger.info('getOpenedWindows', await plugin.getOpenedWindows())
//     logger.info('getDeviceStatus', await plugin.getDeviceStatus())
//     logger.info('dialog.showOpenDialog', await plugin.electronAPI('dialog.showOpenDialog', { properties: ["openDirectory"] }))
//     logger.info('dialog.showSaveDialog', await plugin.electronAPI('dialog.showSaveDialog', { properties: ["openFile"] }))
//     logger.info('dialog.showMessageBox', await plugin.electronAPI('dialog.showMessageBox', { type: "info", message: "Hello from plugin!" }))
//     logger.info('dialog.showErrorBox', await plugin.electronAPI('dialog.showErrorBox', "Error", "This is an error message"))
//     logger.info('app.getAppPath', await plugin.electronAPI('app.getAppPath'))
//     logger.info('app.getPath', await plugin.electronAPI('app.getPath', "temp"))
//     logger.info('screen.getCursorScreenPoint', await plugin.electronAPI('screen.getCursorScreenPoint'))
//     logger.info('screen.getPrimaryDisplay', await plugin.electronAPI('screen.getPrimaryDisplay'))
//     logger.info('screen.getAllDisplays', await plugin.electronAPI('screen.getAllDisplays'))

// }, 2000);

// var state = 0
// setInterval(async () => {
//     const result = await plugin._call('plugin-message', {
//         data: 'Hello from plugin!'
//     })
//     console.log('Received response:', result)
//     if (cycleKey) {
//         plugin.set(cycleKey, {
//             state
//         })
//         state = (state + 1) % 3
//     }
// }, 5000);