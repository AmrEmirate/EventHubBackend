import { Router } from 'express';
import {
    getAllEventsController,
    getEventBySlugController,
    createEventController,
    updateEventController,
    deleteEventController,
    getEventAttendeesController // Pastikan ini juga diimpor
} from './events.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Rute Publik
router.get('/', getAllEventsController);
router.get('/:slug', getEventBySlugController);

// Rute Terproteksi (memerlukan login)
router.post('/', authMiddleware, createEventController);
router.put('/:id', authMiddleware, updateEventController);
router.delete('/:id', authMiddleware, deleteEventController);
router.get('/:id/attendees', authMiddleware, getEventAttendeesController);

export default router;