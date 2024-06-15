import { createApi } from '@reduxjs/toolkit/query/react'
import type { GetStockPrices200Response, ListStocks200Response } from '@repo/api-client'
import { API_BASE_URL } from '@repo/api-client'
import { makeAxiosBaseQuery } from '../../api/axios-base-query'

interface PaginationQueryParams {
  limit?: number
  page?: number
}

interface StockPricesQueryParams extends PaginationQueryParams {
  stockId: string
}

export const stocksApiSlice = createApi({
  baseQuery: makeAxiosBaseQuery({ baseUrl: `${API_BASE_URL}/stocks` }),
  reducerPath: 'stocksApi',
  // Tag types are used for caching and invalidation.
  tagTypes: ['Stock', 'StockPrice'],
  endpoints: (build) => ({
    listAllStocks: build.query<ListStocks200Response, PaginationQueryParams>({
      query: ({ limit = 10, page = 1 }) => `?limit=${limit}&page=${page}`,
      providesTags: (result, error, { page }) => [{ type: 'Stock', id: `PAGE_${page}` }],
      // Only have one cache entry so we can add to it over time
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}?limit=${queryArgs.limit}&page=${queryArgs.page}`
      },
      // Always merge incoming data to the cache entry
      // merge: (currentCache, newItems) => {
      //   currentCache.stocks?.push(...(newItems.stocks || []))
      // },
      // Refetch when the page arg changes
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,

      // Prefetch stock prices for each stock
      //   async onQueryStarted(_, { dispatch, queryFulfilled }) {
      //     // Side-effect when the query starts
      //     const { data } = await queryFulfilled
      //     // Side-effect when the query succeeds
      //     if (data.stocks) {
      //       data.stocks.forEach((stock) => {
      //         // Prefetch the next page of stock prices
      //         dispatch(
      //           stocksApiSlice.util.prefetch(
      //             'listStockPrices',
      //             { stockId: `${stock.id}`, limit: 1, page: 1 },
      //             { force: true }
      //           )
      //         )
      //       })
      //     }
      //   },
    }),
    listStockPrices: build.query<GetStockPrices200Response, StockPricesQueryParams>({
      query: ({ stockId, limit = 10, page = 1 }) => `${stockId}/prices?limit=${limit}&page=${page}`,
      providesTags: (result, error, { stockId, page }) => [
        { type: 'StockPrice', id: `${stockId}_PAGE_${page}` },
      ],
      // Only have one cache entry so we can add to it over time
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.stockId}`
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.prices?.push(...(newItems.prices || []))
      },
      // Refetch when the page arg changes
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
  }),
})

export const { useListAllStocksQuery, useListStockPricesQuery,  } = stocksApiSlice
