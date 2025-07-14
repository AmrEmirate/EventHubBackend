import { Request, Response } from 'express';
import * as eventService from './events.service';
import { UserRole } from '@prisma/client';

// [GET] /api/v1/events - Mendapatkan semua event
export const getAllEventsController = async (req: Request, res: Response) => {
    try {
        const events = await eventService.getAllEvents(req.query);
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil event', error: error.message });
    }
};

// [GET] /api/v1/events/:slug - Mendapatkan event tunggal
export const getEventBySlugController = async (req: Request, res: Response) => {
    try {
        const event = await eventService.getEventBySlug(req.params.slug);
        if (!event) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }
        res.status(200).json(event);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil event', error: error.message });
    }
};

// [POST] /api/v1/events - Membuat event baru (Organizer)
export const createEventController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: 'Akses ditolak. Hanya organizer yang bisa membuat event.' });
    }
    try {
        const eventData = { ...req.body, organizerId: req.user.id };
        const newEvent = await eventService.createEvent(eventData);
        res.status(201).json({ message: 'Event berhasil dibuat', data: newEvent });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal membuat event', error: error.message });
    }
};

// [PUT] /api/v1/events/:id - Memperbarui event (Organizer)
export const updateEventController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        const updatedEvent = await eventService.updateEvent(req.params.id, req.user.id, req.body);
        res.status(200).json({ message: 'Event berhasil diperbarui', data: updatedEvent });
    } catch (error: any) {
        res.status(403).json({ message: error.message });
    }
};

// [DELETE] /api/v1/events/:id - Menghapus event (Organizer)
export const deleteEventController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        await eventService.deleteEvent(req.params.id, req.user.id);
        res.status(200).json({ message: 'Event berhasil dihapus' });
    } catch (error: any) {
        res.status(403).json({ message: error.message });
    }
};

// [GET] /api/v1/events/:id/attendees - Melihat peserta event (Organizer)
export const getEventAttendeesController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: "Akses ditolak." });
    }
    try {
        const attendees = await eventService.getEventAttendees(req.user.id, req.params.id);
        res.status(200).json(attendees);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};