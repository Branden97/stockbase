import apispec from '../index'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import * as openapiSchema from 'openapi-schema-validator/dist/resources/openapi-3.0.json'

type SecuritySchemeObject = {
  type: string
  scheme: string
  bearerFormat?: string
}

function isSecuritySchemeObject(obj: any): obj is SecuritySchemeObject {
  return obj && typeof obj.type === 'string' && typeof obj.scheme === 'string'
}

describe('@repo/api-spec', () => {
  it('is a json object', () => {
    expect(apispec).toEqual(expect.any(Object))
  })

  it('has valid OpenAPI 3.0 schema', () => {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    ajv.addSchema(openapiSchema, 'openapi-3.0')
    const validate = ajv.getSchema('openapi-3.0')
    const valid = validate ? validate(apispec) : false
    if (!valid && validate && validate.errors) {
      console.log('Schema validation errors:', validate.errors)
    }
    expect(valid).toBe(true)
  })

  it('contains necessary paths', () => {
    const paths = apispec.paths
    expect(paths).toHaveProperty('/signup')
    expect(paths).toHaveProperty('/login')
    expect(paths).toHaveProperty('/logoutAll')
    expect(paths).toHaveProperty('/users/{userId}')
    expect(paths).toHaveProperty('/stocks')
    expect(paths).toHaveProperty('/stocks/{stockId}')
    expect(paths).toHaveProperty('/stocks/{stockId}/prices')
    expect(paths).toHaveProperty('/watchlists')
    expect(paths).toHaveProperty('/watchlists/{watchlistId}')
    expect(paths).toHaveProperty('/watchlists/{watchlistId}/stocks')
  })

  it('contains required tags', () => {
    const tags = apispec.tags
    expect(tags).toBeDefined()
    expect(tags).not.toHaveLength(0)
    const tagNames = tags!.map((tag) => tag.name)
    expect(tagNames).toContain('auth')
    expect(tagNames).toContain('users')
    expect(tagNames).toContain('stocks')
    expect(tagNames).toContain('watchlists')
  })

  it('defines security schemes', () => {
    const securitySchemes = apispec.components?.securitySchemes
    expect(securitySchemes).toHaveProperty('JWT_Token')
    expect(securitySchemes).toHaveProperty('JWT_Refresh_Token')

    const jwt_token = securitySchemes?.JWT_Token
    if (isSecuritySchemeObject(jwt_token)) {
      expect(jwt_token.type).toBe('http')
      expect(jwt_token.scheme).toBe('bearer')
      expect(jwt_token.bearerFormat).toBe('JWT')
    } else {
      throw new Error('JWT_Token is not a valid SecuritySchemeObject')
    }
    const jwt_refresh_token = securitySchemes?.JWT_Refresh_Token
    if (isSecuritySchemeObject(jwt_refresh_token)) {
      expect(jwt_refresh_token.type).toBe('http')
      expect(jwt_refresh_token.scheme).toBe('bearer')
      expect(jwt_refresh_token.bearerFormat).toBe('JWT')
    } else {
      throw new Error('JWT_Refresh_Token is not a valid SecuritySchemeObject')
    }
  })

  it('contains valid operation IDs', () => {
    const paths = apispec.paths
    Object.keys(paths).forEach((path) => {
      // @ts-ignore
      Object.keys(paths[path]).forEach((method) => {
        // @ts-ignore
        expect(paths[path][method]).toHaveProperty('operationId')
        // @ts-ignore
        expect(paths[path][method].operationId).toEqual(expect.any(String))
      })
    })
  })

  // I chose to use @ts-ignore instead of refactoring, as refactoring would significantly reduce the code's readability.
  // And if there was a "runtime" error, it'd be caught by the test anyway

  // it('contains valid operation IDs', () => {
  //   const paths = apispec.paths
  //   Object.keys(paths).forEach((path) => {
  //     const pathItem = paths[path]
  //     if (pathItem) {
  //       Object.keys(pathItem).forEach((method) => {
  //         const operation = pathItem[method as keyof typeof pathItem] as { operationId?: string }
  //         if (operation) {
  //           if (typeof operation === 'string') throw new Error('operation is a string')
  //           expect(operation).toHaveProperty('operationId')
  //           expect(operation.operationId).toEqual(expect.any(String))
  //         }
  //       })
  //     }
  //   })
  // })

  it('contains valid operation IDs', () => {
    const paths = apispec.paths
    Object.keys(paths).forEach((path) => {
      const pathItem = paths[path] as { [key: string]: any }
      if (pathItem) {
        Object.keys(pathItem).forEach((method) => {
          const operation = pathItem[method]
          if (operation) {
            expect(operation).toHaveProperty('operationId')
            expect(operation.operationId).toEqual(expect.any(String))
          }
        })
      }
    })
  })

  it('has x-eov-operation-handler in all operations', () => {
    const paths = apispec.paths
    Object.keys(paths).forEach((path) => {
      // @ts-ignore
      Object.keys(paths[path]).forEach((method) => {
        // @ts-ignore
        expect(paths[path][method]).toHaveProperty('x-eov-operation-handler')
        // @ts-ignore
        expect(paths[path][method]['x-eov-operation-handler']).toEqual(
          expect.any(String)
        )
      })
    })
  })

  it('defines all component schemas', () => {
    const schemas = apispec?.components?.schemas
    expect(schemas).toHaveProperty('SignupRequest')
    expect(schemas).toHaveProperty('LoginRequest')
    expect(schemas).toHaveProperty('LoginResponse')
    expect(schemas).toHaveProperty('User')
    expect(schemas).toHaveProperty('Stock')
    expect(schemas).toHaveProperty('StockPrice')
    expect(schemas).toHaveProperty('Watchlist')
    expect(schemas).toHaveProperty('CreateWatchlistRequest')
    expect(schemas).toHaveProperty('WatchlistStock')
    expect(schemas).toHaveProperty('AddStockToWatchlistRequest')
    expect(schemas).toHaveProperty('UpdateUserRequest')
    expect(schemas).toHaveProperty('UpdateWatchlistRequest')
  })
})
