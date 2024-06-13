/**
 * stocks operations:
    - getStock
    - getStockPrices
    - listStocks
 */

// Need to use the React-specific entry point to import `createApi`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { ListStocks200Response } from '@repo/api-client'

interface PaginationQueryParams {
  limit?: number
  page?: number
}
export const stocksApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5001/api/v0/stocks' }),
  reducerPath: 'stocksApi',
  // Tag types are used for caching and invalidation.
  tagTypes: ['Stocks'],
  endpoints: (build) => ({
    listStocks: build.query<ListStocks200Response, PaginationQueryParams>({
      query: ({ limit = 10, page = 1 }) => `?limit=${limit}&page=${page}`,
      providesTags: (result, error, { page }) => [{ type: 'Stocks', id: `PAGE_${page}` }],
      // Only have one cache entry so we can add to it over time
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.stocks?.push(...(newItems.stocks || []))
      },
      // Refetch when the page arg changes
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
  }),
})

export const { useListStocksQuery } = stocksApiSlice
