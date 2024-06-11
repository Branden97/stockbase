import { RequestHandler } from 'express'

interface AsyncRequestHandler extends RequestHandler {
  (req: any, res: any, next: any): Promise<void>
}

/**
 * Wraps an async handler to catch any errors and pass them to the next middleware
 * @param fn The async function to be wrapped
 * @returns A RequestHandler that wraps the async function and catches any errors
 */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
