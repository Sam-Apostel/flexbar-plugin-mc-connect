const { pluginClient, logger, pluginPath, resourcesPath } = require("flexdesigner")

logger.warn(pluginPath, resourcesPath)

pluginClient.on('ui-message', (payload) => {
    console.log('Received message from UI:', payload)
    return 'Hello from plugin!'
})

pluginClient.on('device.initData', (data) => {
    console.log('Received device.initdata:', data)
})

pluginClient.on('device.status', (data) => {
    console.log('Received device.status:', data)
})

pluginClient.on('device.newPage', (data) => {
    console.log('Received device.newpage:', data)
    for (let key of data) {
        key.style.showIcon = false
        key.style.showTitle = true
        key.title = 'Click Me!'
        pluginClient.draw(key, 'draw')
    }
})

const { pluginClient } = require('flexdesigner')

var counter = 1
pluginClient.on('device.userData', (data) => {
    console.log('Received device.userdata:', data)
    const key = data.key
    key.style.showIcon = false
    key.style.showTitle = true
    key.title = `${counter++}`
    pluginClient.draw(key, 'draw')
})

pluginClient.start()


setInterval(async () => {
    const result = await pluginClient._call('plugin-message', {
        data: 'Hello from plugin!'
    })
    console.log('Received response:', result)
}, 5000);