import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  // TODO: Handle various error cases here
  console.error(err)

  // Set the response status code
  // @ts-ignore
  res.status(err.status || 500)

  // Send the error message as the response
  res.json({
    // @ts-ignore
    errors: err?.errors,
    error: err.message || 'Internal Server Error',
  })
}
