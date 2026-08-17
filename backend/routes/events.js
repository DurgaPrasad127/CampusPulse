import { Router } from 'express';
import { createEvent, deleteEvent, listEvents, updateEvent } from '../controllers/eventController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, listEvents);
router.post('/', requireAuth, requireAdmin, createEvent);
router.put('/:id', requireAuth, requireAdmin, updateEvent);
router.delete('/:id', requireAuth, requireAdmin, deleteEvent);
export default router;
