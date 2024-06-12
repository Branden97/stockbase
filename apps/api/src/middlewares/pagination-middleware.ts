/* eslint-disable @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment -- It's okay for req.query.limit and req.query.page to be a number */
import type { RequestHandler } from 'express'
import { loadApiConfig } from '../config'

interface PaginationMeta {
  totalPages: number
  totalItems: number
  limit: number
  currentPage: number
}

const apiConfig = loadApiConfig()
const defaultLimit = apiConfig.PAGINATION_LIMIT
const maxLimit = apiConfig.PAGINATION_LIMIT_MAX

function determineLimit(limit: string | undefined): number {
  if (limit === undefined) {
    return defaultLimit
  }

  const parsedLimit = parseInt(limit)
  if (isNaN(parsedLimit)) {
    return defaultLimit
  }

  return Math.min(parsedLimit, maxLimit)
}
function determinePage(page: string | undefined): number {
  if (page === undefined) {
    return 1
  }

  const parsedPage = parseInt(page)
  if (isNaN(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

/**
 * Generates pagination metadata for a given request
 * @param req - The request object
 * @param itemCount - The total number of items
 * @returns Pagination metadata
 */
export function getPaginationMeta(req: Express.Request, itemCount: number): PaginationMeta {
  const limit = req.query.limit
  const page = req.query.page
  const pageCount = Math.ceil(itemCount / limit)

  return {
    totalPages: pageCount,
    totalItems: itemCount,
    limit,
    currentPage: page,
  }
}

export const paginationMiddleware: RequestHandler = (req, res, next) => {
  // Store the original query parameters
  const limit = determineLimit(`${req.query.limit}`)
  const page = determinePage(`${req.query.page}`)
  const skip = (page - 1) * limit

  // @ts-ignore
  req.query.limit = limit

  // @ts-ignore
  req.query.page = page
  req.skip = skip

  // Proceed to the next middleware or route handler
  next()
}
