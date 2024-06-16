export * from './generated'
import axios, { AxiosRequestConfig } from 'axios'
import { AuthApi, Configuration, StocksApi, UsersApi, WatchlistsApi } from './generated'

export const axiosInstance = axios.create()
export const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NODE_ENV === 'production' ? '/api/v0' : 'http://localhost:5001/api/v0'



// TODO: debug why the env var isn't coming through in docker...
// console.log(`====================================================================================================`)
// console.log(`====================================================================================================`)
// console.log(`====================================================================================================`)
// console.log(`====`)
// console.log(`====`)
// console.log(`====`)
// console.log(`====    NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}`)
// console.log(`====`)
// console.log(`====`)
// console.log(`====`)
// console.log(`====================================================================================================`)
// console.log(`====================================================================================================`)
// console.log(`====================================================================================================`)


export class ApiClient {
  private _configuration: Configuration
  private _authApi: AuthApi
  private _usersApi: UsersApi
  private _stocksApi: StocksApi
  private _watchlistsApi: WatchlistsApi

  constructor() {
    this._configuration = new Configuration({
      basePath: NEXT_PUBLIC_API_BASE_URL,
      baseOptions: { withCredentials: true } as AxiosRequestConfig,
    })
    this._authApi = new AuthApi(this._configuration, NEXT_PUBLIC_API_BASE_URL, axiosInstance)
    this._usersApi = new UsersApi(this._configuration, NEXT_PUBLIC_API_BASE_URL, axiosInstance)
    this._stocksApi = new StocksApi(this._configuration, NEXT_PUBLIC_API_BASE_URL, axiosInstance)
    this._watchlistsApi = new WatchlistsApi(this._configuration, NEXT_PUBLIC_API_BASE_URL, axiosInstance)
  }

  get authApi() {
    return this._authApi
  }

  get usersApi() {
    return this._usersApi
  }

  get stocksApi() {
    return this._stocksApi
  }

  get watchlistsApi() {
    return this._watchlistsApi
  }
}
