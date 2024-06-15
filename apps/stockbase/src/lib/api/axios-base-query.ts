import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { axiosInstance } from '@repo/api-client'
import type { AxiosRequestConfig } from 'axios'
import { errorToaster } from '../notify-errors'

/**
 * This file contains the implementation of a base query function for making HTTP requests using Axios.
 * It is designed to be used with RTK Query's createApi function.
 */

/**
 * Represents the arguments for the AxiosBaseQuery function.
 */
interface AxiosBaseQueryArgs {
  url: string
  method: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
}

/**
 * Represents the base query function for making HTTP requests using Axios.
 */
type AxiosBaseQuery = BaseQueryFn<AxiosBaseQueryArgs | string>

/**
 * Represents a function that creates a base query function for making HTTP requests using Axios.
 * @param baseUrl - The base URL for the API.
 * @returns The base query function.
 */
type MakeAxiosBaseQuery = ({ baseUrl }: { baseUrl: string }) => AxiosBaseQuery

/**
 * Creates a base query function for making HTTP requests using Axios.
 * @param baseUrl - The base URL for the API.
 * @returns The base query function.
 */
export const makeAxiosBaseQuery: MakeAxiosBaseQuery = ({ baseUrl }) => {
  /**
   * Base query function for making HTTP requests using Axios.
   * @param args - The request arguments.
   * @returns The response or error object.
   */
  const baseQueryFn: AxiosBaseQuery = async (args) => {
    const { url, method, data, params } =
      typeof args === 'string'
        ? { url: args, method: 'GET', data: undefined, params: undefined }
        : args
    try {
      const result = await axiosInstance({
        url: `${baseUrl}/${url}`,
        method,
        data,
        params,
        headers: { cache: 'no-cache' },
      })
      return { data: result.data }
    } catch (err) {
      errorToaster(err)
      return {
        error: {
          // @ts-expect-error
          status: err?.response?.status,
          // @ts-expect-error
          data: err?.response?.data || err?.message,
        },
      }
    }
  }

  return baseQueryFn
}
