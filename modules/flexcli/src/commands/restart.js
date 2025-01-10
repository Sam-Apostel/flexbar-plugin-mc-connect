// commands/restart.js
import logger from '../utils/logger.js';

/**
 * Handles the 'restart' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function restartCommand(wsClient, options) {
  const { uuid } = options;
  const cmd = `plugin operation=restart --uuid=${uuid}`;

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.result === 'success') {
      logger.info(`Restart command successful: ${response.payload}`);
    } else {
      logger.error(`Restart command failed: ${response.payload}`);
    }
  } catch (error) {
    logger.error(`Error in restart command: ${error.message}`);
  }
}
