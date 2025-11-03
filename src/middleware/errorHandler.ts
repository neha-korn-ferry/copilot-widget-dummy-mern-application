import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
}

export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    // Fix for captureStackTrace
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || false;

  // Log error for debugging
  if (config.nodeEnv === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    // In production, log minimal info
    console.error("Error:", {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Don't leak error details in production unless it's an operational error
  const message =
    isOperational || config.nodeEnv === "development"
      ? err.message
      : "Internal server error";

  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

