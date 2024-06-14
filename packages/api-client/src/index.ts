export * from './generated'
import axios, { AxiosRequestConfig } from 'axios'
import { AuthApi, Configuration, StocksApi, UsersApi, WatchlistsApi } from './generated'

export const axiosInstance = axios.create()
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v0'

export class ApiClient {
  private _configuration: Configuration
  private _authApi: AuthApi
  private _usersApi: UsersApi
  private _stocksApi: StocksApi
  private _watchlistsApi: WatchlistsApi

  constructor() {
    this._configuration = new Configuration({
      basePath: API_BASE_URL,
      baseOptions: { withCredentials: true } as AxiosRequestConfig,
    })
    this._authApi = new AuthApi(this._configuration, API_BASE_URL, axiosInstance)
    this._usersApi = new UsersApi(this._configuration, API_BASE_URL, axiosInstance)
    this._stocksApi = new StocksApi(this._configuration, API_BASE_URL, axiosInstance)
    this._watchlistsApi = new WatchlistsApi(this._configuration, API_BASE_URL, axiosInstance)
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
