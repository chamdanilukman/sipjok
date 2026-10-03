import { Router } from 'express';
import { db } from '../db';
import { modulAjar, insertModulAjarSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const modules = await db.query.modulAjar.findMany({
      where: eq(modulAjar.teacher_id, req.user!.id),
      orderBy: [desc(modulAjar.created_at)],
      limit,
      offset,
    });
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const module = await db.query.modulAjar.findFirst({
      where: and(eq(modulAjar.id, req.params.id), eq(modulAjar.teacher_id, req.user!.id)),
    });
    if (!module) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertModulAjarSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { judul, atp_id, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu, pertemuan_ke, profil_pelajar_pancasila, sarana_prasarana, target_peserta_didik, model_pembelajaran, kegiatan_pembelajaran, asesmen, pengayaan, refleksi, file_url, file_name, file_type, status, data } = parsed.data;
    if (!judul) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required field: judul' });
    }

    const [newModule] = await db.insert(modulAjar)
      .values({ teacher_id: req.user!.id, judul, atp_id, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu, pertemuan_ke, profil_pelajar_pancasila, sarana_prasarana, target_peserta_didik, model_pembelajaran, kegiatan_pembelajaran, asesmen, pengayaan, refleksi, file_url, file_name, file_type, status, data })
      .returning();
    res.status(201).json(newModule);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertModulAjarSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { judul, atp_id, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu, pertemuan_ke, profil_pelajar_pancasila, sarana_prasarana, target_peserta_didik, model_pembelajaran, kegiatan_pembelajaran, asesmen, pengayaan, refleksi, file_url, file_name, file_type, status, data } = parsed.data;
    const [updated] = await db.update(modulAjar)
      .set({ judul, atp_id, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu, pertemuan_ke, profil_pelajar_pancasila, sarana_prasarana, target_peserta_didik, model_pembelajaran, kegiatan_pembelajaran, asesmen, pengayaan, refleksi, file_url, file_name, file_type, status, data, updated_at: new Date() })
      .where(and(eq(modulAjar.id, req.params.id), eq(modulAjar.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(modulAjar)
      .where(and(eq(modulAjar.id, req.params.id), eq(modulAjar.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json({ message: 'Module deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
