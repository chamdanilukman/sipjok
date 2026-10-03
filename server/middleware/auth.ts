import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email?: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  return token || null;
}

/**
 * Authentication middleware
 * Verifies the internal JWT issued by POST /api/auth/login and attaches
 * req.user = { id, email } — the same shape every API route already expects.
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided. Expected: Bearer <token>',
      });
      return;
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    } catch {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }

    if (!payload.sub) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload',
      });
      return;
    }

    req.user = {
      id: payload.sub as string,
      email: (payload.username as string) || undefined,
    };

    // Log authentication (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated user: ${req.user.email} (${req.user.id})`);
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block if missing
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    if (payload.sub) {
      req.user = {
        id: payload.sub as string,
        email: (payload.username as string) || undefined,
      };
    }
  } catch {
    // Ignore invalid tokens in optional auth
  }
  next();
}
