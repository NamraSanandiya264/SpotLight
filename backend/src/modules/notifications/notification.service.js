import Notification from './notification.model.js';

/**
 * Centrally manages the creation of system and user notifications.
 * * @param {Object} params
 * @param {String} params.recipientId - The ID of the user receiving the notification
 * @param {String} [params.senderId=null] - The ID of the user triggering it (optional)
 * @param {String} params.message - The text body of the notification
 * @param {String} params.type - Must match one of the enums in the model
 * @param {String} [params.link=null] - Frontend route to navigate to on click
 * @returns {Promise<Object>} The created notification document
 */
export const createNotification = async ({
  recipientId,
  senderId = null,
  message,
  type,
  link = null,
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      senderId,
      message,
      type,
      link,
    });
    
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
    return null; 
  }
};