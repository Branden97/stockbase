import { error } from '@repo/logger'
import { type ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  // TODO: Handle various error cases here
  error(err)

  // Set the response status code
  res.status('status' in err && typeof err.status === 'number' ? err.status : 500)

  // Send the error message as the response
  res.json({
    errors: 'errors' in err ? err.errors : undefined,
    error: err.message || 'Internal Server Error',
  })
}
