export * from './generated'
// import axios from 'axios'
import { Configuration, AuthApi, UsersApi, StocksApi, WatchlistsApi } from './generated'

export class ApiClient {
  private _configuration: Configuration
  private _authApi: AuthApi
  private _usersApi: UsersApi
  private _stocksApi: StocksApi
  private _watchlistsApi: WatchlistsApi

  constructor() {
    this._configuration = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v0',
      baseOptions: { withCredentials: true },
    })
    this._authApi = new AuthApi(this._configuration)
    this._usersApi = new UsersApi(this._configuration)
    this._stocksApi = new StocksApi(this._configuration)
    this._watchlistsApi = new WatchlistsApi(this._configuration)
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
