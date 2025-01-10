// commands/list.js
import logger from '../utils/logger.js';

/**
 * Handles the 'list' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 */
export default async function listCommand(wsClient) {
  const cmd = `plugin operation=list`;

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.result === 'success') {
      const plugins = JSON.parse(response.payload);
      plugins.forEach(plugin => {
        logger.info(`Plugin UUID: ${plugin.uuid}`);
      });
    } else {
      logger.error(`List command failed: ${response.payload}`);
    }
  } catch (error) {
    logger.error(`Error in list command: ${error.message}`);
  }
}
