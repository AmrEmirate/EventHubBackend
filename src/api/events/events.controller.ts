import { Request, Response } from 'express';
import * as eventService from './events.service';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const createEventSchema = z.object({
  name: z.string().min(5, { message: "Nama minimal 5 karakter" }),
  description: z.string().min(20, { message: "Deskripsi minimal 20 karakter" }),
  category: z.string().min(1, { message: "Kategori wajib diisi"}),
  location: z.string().min(1, { message: "Lokasi wajib diisi"}),
  startDate: z.coerce.date(), 
  endDate: z.coerce.date(),
  price: z.number().min(0),
  isFree: z.boolean().default(false),
  ticketTotal: z.number().int().positive({ message: "Jumlah tiket harus angka positif" })
});

const updateEventSchema = createEventSchema.partial();

export const getAllEventsController = async (req: Request, res: Response) => {
    try {
        const events = await eventService.getAllEvents(req.query);
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil event', error: error.message });
    }
};

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

export const createEventController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: 'Akses ditolak. Hanya organizer yang bisa membuat event.' });
    }
    try {
        const validatedData = createEventSchema.parse(req.body);
        const eventData = { ...validatedData, organizerId: req.user.id };
        const newEvent = await eventService.createEvent(eventData);
        res.status(201).json({ message: 'Event berhasil dibuat', data: newEvent });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
        }
        res.status(500).json({ message: 'Gagal membuat event', error: error.message });
    }
};

export const updateEventController = async (req: Request, res: Response) => {
    if (req.user?.role !== UserRole.ORGANIZER) {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        const validatedData = updateEventSchema.parse(req.body);
        // Di backend, update menggunakan eventId dari params, bukan slug
        const updatedEvent = await eventService.updateEvent(req.params.id, req.user.id, validatedData);
        res.status(200).json({ message: 'Event berhasil diperbarui', data: updatedEvent });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
        }
        res.status(403).json({ message: error.message });
    }
};

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

// [BARU] Controller untuk mengambil event milik organizer
export const getMyOrganizerEventsController = async (req: Request, res: Response) => {
    if (req.user?.role !== 'ORGANIZER') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        const events = await eventService.getMyOrganizerEvents(req.user.id);
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil event Anda', error: error.message });
    }
};
