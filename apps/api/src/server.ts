import path from 'node:path'
import { json, urlencoded } from 'body-parser'
import express, { type Express } from 'express'
import asyncify from 'express-asyncify'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import serverTiming from 'server-timing'
import swaggerUI from 'swagger-ui-express'
import schema from '@repo/api-spec'
import * as OpenApiValidator from 'express-openapi-validator'
import { log } from '@repo/logger'
import { connectToDatabase, User } from '@repo/db'
import {
  addStockToWatchlistHandler,
  createWatchlistHandler,
  deleteUserHandler,
  deleteWatchlistHandler,
  getStockHandler,
  getStockPricesHandler,
  getUserHandler,
  getWatchlistHandler,
  listStocksHandler,
  listStocksInWatchlistHandler,
  listWatchlistsHandler,
  loginHandler,
  logoutAllHandler,
  removeStockFromWatchlistHandler,
  signupHandler,
  updateUserHandler,
  updateWatchlistHandler,
} from './operation-handlers'
import { errorHandler } from './error-handler'
import { handleTestingEndpointRequest } from './testing-endpoint'

export const createServer = (): Express => {
  const app = express()
  app
    .disable('x-powered-by')
    .use(morgan('dev')) // Logging
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get('/status', (_, res) => {
      return res.json({ ok: true })
    })
    .get('/testing', handleTestingEndpointRequest)
    // req.protocol will be based on the X-Forwarded-Proto header now
    .enable('trust proxy')
    .use(cookieParser())
    .use(
      serverTiming({
        // Only send metrics if a cookie `debug_server_timing` is set to `1`
        enabled: (req, res) => {
          return (
            process.env['NODE_ENV'] === 'development' ||
            ('debug_server_timing' in req.cookies && req.cookies.debug_server_timing !== '0')
          )
        },
      })
    )
    .use('/api-docs', swaggerUI.serve, swaggerUI.setup(schema))
    .use(
      OpenApiValidator.middleware({
        // @ts-ignore
        apiSpec: schema,
        validateRequests: true, // (default)
        validateResponses: true, // false by default
      })
    )
    // Manually set up routes with imported handlers 'cause setting up dynamic imports for OpenApiValidator is a headache
    .post('/api/v0/signup', signupHandler)
    .post('/api/v0/login', loginHandler)
    .post('/api/v0/logoutAll', logoutAllHandler)
    .get('/api/v0/users/:userId', getUserHandler)
    .patch('/api/v0/users/:userId', updateUserHandler)
    .delete('/api/v0/users/:userId', deleteUserHandler)
    .get('/api/v0/stocks', listStocksHandler)
    .get('/api/v0/stocks/:stockId', getStockHandler)
    .get('/api/v0/stocks/:stockId/prices', getStockPricesHandler)
    .get('/api/v0/watchlists', listWatchlistsHandler)
    .post('/api/v0/watchlists', createWatchlistHandler)
    .get('/api/v0/watchlists/:watchlistId', getWatchlistHandler)
    .patch('/api/v0/watchlists/:watchlistId', updateWatchlistHandler)
    .delete('/api/v0/watchlists/:watchlistId', deleteWatchlistHandler)
    .post('/api/v0/watchlists/:watchlistId/stocks', addStockToWatchlistHandler)
    .get('/api/v0/watchlists/:watchlistId/stocks', listStocksInWatchlistHandler)
    .delete('/api/v0/watchlists/:watchlistId/stocks/:stockId', removeStockFromWatchlistHandler)
    .use(errorHandler)

  // Log all routes
  // log(
  //   app._router.stack.map((layer) => `${layer.name}: ${layer.regexp}`)
  // )

  // Connect to the database
  ;(async (expressApp: Express) => {
    expressApp.db = await connectToDatabase()
  })(app).catch((error) => {
    log('Error connecting to database:', error)
  })

  return app
}
