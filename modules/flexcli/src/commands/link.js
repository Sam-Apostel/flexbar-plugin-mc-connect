// commands/link.js
import logger from '../utils/logger.js';

/**
 * Handles the 'link' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function linkCommand(wsClient, options) {
  const { path, uuid } = options;
  const cmd = `plugin operation=link --path=${path} --uuid=${uuid}`;

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.result === 'success') {
      logger.info(`Link command successful: ${response.payload}`);
    } else {
      logger.error(`Link command failed: ${response.payload}`);
    }
  } catch (error) {
    logger.error(`Error in link command: ${error.message}`);
  }
}
