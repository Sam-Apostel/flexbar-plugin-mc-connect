// commands/unlink.js
import logger from '../utils/logger.js';

/**
 * Handles the 'unlink' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function unlinkCommand(wsClient, options) {
  const { uuid } = options;
  const cmd = `plugin operation=unlink --uuid=${uuid}`;

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.result === 'success') {
      logger.info(`Unlink command successful: ${response.payload}`);
    } else {
      logger.error(`Unlink command failed: ${response.payload}`);
    }
  } catch (error) {
    logger.error(`Error in unlink command: ${error.message}`);
  }
}
