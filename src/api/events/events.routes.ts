import { Router } from 'express';
import {
    getAllEventsController,
    getEventBySlugController,
    createEventController,
    updateEventController,
    deleteEventController,
    getEventAttendeesController,
    getMyOrganizerEventsController // Impor controller baru
} from './events.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Rute Publik
router.get('/', getAllEventsController);

// [BARU] Rute untuk mendapatkan event milik organizer
// PENTING: Tempatkan rute ini SEBELUM rute dinamis '/:slug'
router.get('/organizer/my-events', authMiddleware, getMyOrganizerEventsController);

// Rute dinamis untuk slug harus setelah rute yang lebih spesifik
router.get('/:slug', getEventBySlugController);

// Rute Terproteksi (memerlukan login)
router.post('/', authMiddleware, createEventController);
router.put('/:id', authMiddleware, updateEventController);
router.delete('/:id', authMiddleware, deleteEventController);
router.get('/:id/attendees', authMiddleware, getEventAttendeesController);

export default router;
