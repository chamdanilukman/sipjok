import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Where uploaded files live. On the VPS this points to a persistent dir.
export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_MB = parseInt(process.env.UPLOAD_MAX_MB || '25', 10);

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'png', 'jpg', 'jpeg', 'gif', 'webp',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_ ]/g, '_')
      .slice(0, 80)
      .trim() || 'file';
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Tipe file .${ext} tidak diizinkan`));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/uploads
 * Multipart upload (field "file") → saved on local disk, returns its URL & path.
 * Replacement for the old client-side Supabase Storage upload.
 */
router.post('/', authenticateUser, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Tidak ada file yang dikirim (field: file)',
    });
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    path: req.file.filename,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

/**
 * DELETE /api/uploads?path=<filename>
 * Removes a previously uploaded file (filename only — no traversal).
 */
router.delete('/', authenticateUser, (req, res) => {
  const parsed = z.string().min(1).safeParse(req.query.path);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameter path wajib diisi' });
  }

  const target = path.resolve(UPLOAD_DIR, path.basename(parsed.data));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) {
    return res.status(400).json({ error: 'Validation Error', message: 'Path tidak valid' });
  }

  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
  res.json({ message: 'File dihapus' });
});

export default router;
