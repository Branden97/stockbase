interface PaginationMeta {
  totalPages: number
  totalItems: number
  limit: number
  currentPage: number
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
