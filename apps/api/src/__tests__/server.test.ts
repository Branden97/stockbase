import supertest from 'supertest'
import { type Express } from 'express'
import { log } from '@repo/logger'
import { createServer } from '../server'
import { JwtService } from '../middlewares/auth-middleware'

const apiPrefix = '/api/v0'
// const VALID_TOKEN = 'asdf'
// const VALID_REFRESH_TOKEN = 'asdf'

const { token: VALID_TOKEN, refreshToken: VALID_REFRESH_TOKEN } = JwtService.createTokenPair({
  userId: 1,
})

describe('API Server', () => {
  let app: Express

  beforeAll(async () => {
    // Initialize the server only when running this suite
    app = await createServer()
  })

  afterAll(async () => {
    // Optionally, close the server or perform cleanup if necessary
    await app.db.close()
  })

  describe('Health Check', () => {
    it('returns 200', async () => {
      await supertest(app)
        .get('/status')
        .expect(200)
        .then((res) => {
          expect(res.ok).toBe(true)
        })
    })
  })

  describe('User Operations', () => {
    it('signup returns 201', async () => {
      await supertest(app)
        .post(`${apiPrefix}/signup`)
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('username', 'testuser')
        })
    })

    it('login returns 200', async () => {
      await supertest(app)
        .post(`${apiPrefix}/login`)
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('token')
        })
    })

    it('refreshToken returns 200', async () => {
      await supertest(app)
        .get(`${apiPrefix}/refreshToken`)
        .set('Cookie', [`refreshToken=${VALID_REFRESH_TOKEN}`])
        .expect((res) => {
          if (res.status !== 200) {
            log('response body:\n', JSON.stringify(res.body, null, 2))
          }
        })
        .expect(200)
    })

    it('refreshToken returns 401 if no refreshToken cookie', async () => {
      await supertest(app).get(`${apiPrefix}/refreshToken`).expect(401)
    })

    it('logoutAll returns 204', async () => {
      await supertest(app)
        .get(`${apiPrefix}/logoutAll`)
        .set('Cookie', [`token=${VALID_TOKEN}`])
        .expect(204)
    })

    it('logoutAll returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/logoutAll`).expect(401)
    })

    it('logout returns 204', async () => {
      await supertest(app)
        .get(`${apiPrefix}/logout`)
        .set('Cookie', [`token=${VALID_TOKEN}`])
        .expect(204)
    })

    it('logout returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/logout`).expect(401)
    })

    it('getUser returns 200', async () => {
      await supertest(app)
        .get(`${apiPrefix}/users/1`)
        .set('Cookie', [`token=${VALID_TOKEN}`])
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', 1)
        })
    })

    it('getUser returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/users/1`).expect(401)
    })

    it('updateUser returns 200', async () => {
      await supertest(app)
        .patch(`${apiPrefix}/users/1`)
        .set('Cookie', [`token=${VALID_TOKEN}`])
        .send({ username: 'updatedUser', email: 'updated@example.com' })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('username', 'updatedUser')
        })
    })

    it('updateUser returns 401 when unauthorized', async () => {
      await supertest(app)
        .patch(`${apiPrefix}/users/1`)
        .send({ username: 'updatedUser', email: 'updated@example.com' })
        .expect(401)
    })

    it('deleteUser returns 204', async () => {
      await supertest(app)
        .delete(`${apiPrefix}/users/1`)
        .set('Cookie', [`token=${VALID_TOKEN}`])
        .expect(204)
    })
    it('deleteUser returns 401 when unauthorized', async () => {
      await supertest(app).delete(`${apiPrefix}/users/1`).expect(401)
    })
  })

  describe('Stock Operations', () => {
    it('listStocks returns 200', async () => {
      await supertest(app)
        .get(`${apiPrefix}/stocks`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })

    it('getStock returns 200', async () => {
      await supertest(app)
        .get(`${apiPrefix}/stocks/1`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', 1)
        })
    })

    it('getStockPrices returns 200', async () => {
      await supertest(app)
        .get(`${apiPrefix}/stocks/1/prices`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })
  })

  describe('Watchlist Operations', () => {
    describe('Authorized', () => {
      beforeAll(() => {
        // mock app.jwtService
      })
      it('listWatchlists returns 200', async () => {
        await supertest(app)
          .get(`${apiPrefix}/watchlists`)
          .set('Cookie', `token=${VALID_TOKEN}`)
          .expect(200)
          .then((res) => {
            expect(Array.isArray(res.body)).toBe(true)
          })
      })

      it('createWatchlist returns 201', async () => {
        const expectedStatusCode = 201
        await supertest(app)
          .post(`${apiPrefix}/watchlists`)
          .send({ name: 'New Watchlist' })
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .expect((res) => {
            if (res.status !== expectedStatusCode) {
              log('response body:\n', JSON.stringify(res.body, null, 2))
            }
          })
          .expect(expectedStatusCode)
          .then((res) => {
            expect(res.body).toHaveProperty('name', 'New Watchlist')
            expect(res.body).toHaveProperty('id', 1)
          })
      })

      it('getWatchlist returns 200', async () => {
        await supertest(app)
          .get(`${apiPrefix}/watchlists/1`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .expect(200)
          .then((res) => {
            expect(res.body).toHaveProperty('id', 1)
          })
      })

      it('updateWatchlist returns 200', async () => {
        await supertest(app)
          .patch(`${apiPrefix}/watchlists/1`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .send({ name: 'Updated Watchlist' })
          .expect(200)
          .then((res) => {
            expect(res.body).toHaveProperty('name', 'Updated Watchlist')
          })
      })

      it('deleteWatchlist returns 204', async () => {
        await supertest(app)
          .delete(`${apiPrefix}/watchlists/1`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .expect(204)
      })

      it('addStockToWatchlist returns 201', async () => {
        await supertest(app)
          .post(`${apiPrefix}/watchlists/1/stocks`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .send({ stockId: 1 })
          .expect(201)
          .then((res) => {
            expect(res.body).toHaveProperty('stockId', 1)
          })
      })

      it('listStocksInWatchlist returns 200', async () => {
        await supertest(app)
          .get(`${apiPrefix}/watchlists/1/stocks`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .expect(200)
          .then((res) => {
            expect(Array.isArray(res.body)).toBe(true)
          })
      })

      it('removeStockFromWatchlist returns 204', async () => {
        await supertest(app)
          .delete(`${apiPrefix}/watchlists/1/stocks/1`)
          .set('Cookie', [`token=${VALID_TOKEN}`])
          .expect(204)
      })
    })

    // Unauthorized
    it('listWatchlists returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/watchlists`).expect(401)
    })
    it('createWatchlist returns 401 when unauthorized', async () => {
      await supertest(app)
        .post(`${apiPrefix}/watchlists`)
        .send({ name: 'New Watchlist' })
        .expect(401)
    })
    it('getWatchlist returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/watchlists/1`).expect(401)
    })
    it('updateWatchlist returns 401 when unauthorized', async () => {
      await supertest(app)
        .patch(`${apiPrefix}/watchlists/1`)
        .send({ name: 'Updated Watchlist' })
        .expect(401)
    })
    it('deleteWatchlist returns 401 when unauthorized', async () => {
      await supertest(app).delete(`${apiPrefix}/watchlists/1`).expect(401)
    })
    it('addStockToWatchlist returns 401 when unauthorized', async () => {
      await supertest(app).post(`${apiPrefix}/watchlists/1/stocks`).send({ stockId: 1 }).expect(401)
    })
    it('listStocksInWatchlist returns 401 when unauthorized', async () => {
      await supertest(app).get(`${apiPrefix}/watchlists/1/stocks`).expect(401)
    })
    it('removeStockFromWatchlist returns 401 when unauthorized', async () => {
      await supertest(app).delete(`${apiPrefix}/watchlists/1/stocks/1`).expect(401)
    })
  })
})
