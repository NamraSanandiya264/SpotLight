import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null implies an automated system notification
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'BOOKING_APPROVED',
        'BOOKING_REJECTED',
        'CLUB_JOIN_REQUEST',
        'CLUB_JOIN_ACCEPTED',
        'EVENT_APPROVED',
        'EVENT_REJECTED',
        'SYSTEM_ALERT'
      ],
      required: true,
    },
    link: {
      type: String,
      default: null, // Optional frontend route to navigate when clicked
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster queries since we will fetch unread notifications frequently
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;