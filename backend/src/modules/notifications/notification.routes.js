import express from 'express';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead 
} from './notification.controller.js';

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); 

router.get('/', getUserNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
