const { pluginClient, logger, pluginPath, resourcesPath } = require("flexdesigner")

logger.warn(pluginPath, resourcesPath)

pluginClient.on('ui-message', (payload) => {
    console.log('Received message from UI:', payload)
    return 'Hello from plugin!'
})

pluginClient.on('device.init', (data) => {
    console.log('Received device.init:', data)
})

pluginClient.on('device.status', (data) => {
    console.log('Received device.status:', data)
})

pluginClient.on('plugin.alive', (data) => {
    console.log('Received plugin.alive:', data)
    for (let key of data) {
        if (key.cid === 'com.eniac.test.screenshot') {
            key.style.showIcon = false
            key.style.showTitle = true
            key.title = 'Click Me!'
            pluginClient.draw(key, 'draw')
        }
        else if (key.cid === 'com.eniac.test.slider') {
            pluginClient.set(key, {
                value: 50
            })
        }
    }
})


var counter = 1
var cycleKey = null
pluginClient.on('plugin.data', (data) => {
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
        pluginClient.draw(key, 'draw')
    }
})

pluginClient.start()

var state = 0
setInterval(async () => {
    const result = await pluginClient._call('plugin-message', {
        data: 'Hello from plugin!'
    })
    console.log('Received response:', result)
    if (cycleKey) {
        pluginClient.set(cycleKey, {
            state
        })
        state = (state + 1) % 3
    }
}, 5000);