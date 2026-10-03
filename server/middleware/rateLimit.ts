import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // tiap halaman memuat /auth/me + profil berkali-kali; 300/menit aman untuk pemakaian nyata
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Please try again later',
  },
});
