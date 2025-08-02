export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500)
  }
}

/**
 * Error handler middleware
 * @param error - Error object
 * @returns Formatted error response
 */
export function handleError(error: unknown) {
  console.error("Error:", error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
        statusCode: 500,
      },
    }
  }

  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  }
}
