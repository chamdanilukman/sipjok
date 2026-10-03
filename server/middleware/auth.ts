import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabase';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies Supabase JWT token and attaches user to request
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No authorization header provided' 
      });
      return;
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Expected: Bearer <token>' 
      });
      return;
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
      return;
    }

    if (!user) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found' 
      });
      return;
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
    };

    // Log authentication (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated user: ${user.email} (${user.id})`);
    }

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication failed' 
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
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        ...user.user_metadata,
      };
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
}
