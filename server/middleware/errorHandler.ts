import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error (in production, you might want to use a logging service)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  // Handle Drizzle/Database errors
  if (err.message.includes('violates foreign key constraint')) {
    res.status(400).json({
      error: 'Invalid reference',
      message: 'The referenced record does not exist',
    });
    return;
  }

  if (err.message.includes('duplicate key value')) {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this value already exists',
    });
    return;
  }

  // Handle validation errors (Zod)
  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation error',
      message: 'Invalid input data',
      details: err,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
