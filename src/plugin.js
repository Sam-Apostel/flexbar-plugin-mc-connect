const { pluginClient, logger, pluginPath, resourcesPath } = require("flexdesigner")

logger.warn(pluginPath, resourcesPath)

pluginClient.on('ui-message', (payload) => {
    console.log('Received message from UI:', payload)
    return 'Hello from plugin!'
})
  
pluginClient.start()


setInterval(async () => {
    const result = await pluginClient.call({
        data: 'Hello from plugin!'
    })
    console.log('Received response:', result)
}, 5000);