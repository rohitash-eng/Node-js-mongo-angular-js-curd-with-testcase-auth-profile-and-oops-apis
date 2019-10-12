/* eslint-disable */
const request = require('supertest')

const App = require('../../src/App')
const Trucate = require('../utils/Trucate')
const Factory = require('../utils/Factory/User')

describe('User', () => {
  beforeEach(async done => {
    await Trucate.users()
    done()
  })

  it('should return jwt token when authenticated', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    const response = await request(App)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: 'mypass123'
      })

    expect(response.body).toHaveProperty('token')

    done()
  })

  it('should not return jwt token when authenticated fail', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    const response = await request(App)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: 'mypass'
      })

    expect(response.body).not.toHaveProperty('token')

    done()
  })

  it('should authenticate with valid credentials', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    const response = await request(App)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: 'mypass123'
      })

    expect(response.status).toBe(200)

    done()
  })

  it('should not authenticate with invalid credentials', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    const response = await request(App)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: '123456'
      })

    expect(response.status).toBe(400)

    done()
  })

  it('should not authenticate when user not found', async done => {
    const response = await request(App)
      .post('/api/v1/sessions')
      .send({
        fullName: 'Foo',
        email: 'test@email.com',
        password: 'mypass'
      })

    expect(response.status).toBe(400)

    done()
  })

  it('should be able to access private routes when authenticated', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    let response = await request(App)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: 'mypass123'
      })

    expect(response.status).toBe(200)

    response = await request(App)
      .get('/api/v1/app')
      .set('Authorization', `Bearer ${response.body.token}`)

    expect(response.status).toBe(200)

    done()
  })

  it('should not be able to access private routes without jwt token', async done => {
    const response = await request(App).get('/api/v1/app')

    expect(response.status).toBe(401)

    done()
  })

  it('should not be able to access private routes with jwt token split error', async done => {
    const response = await request(App)
      .get('/api/v1/app')
      .set('Authorization', `123 123 123`)

    expect(response.status).toBe(401)

    done()
  })

  it('should not be able to access private routes when jwt token malformatted', async done => {
    const response = await request(App)
      .get('/api/v1/app')
      .set('Authorization', `123123`)

    expect(response.status).toBe(401)

    done()
  })

  it('should not be able to access private routes with invalid jwt token', async done => {
    const response = await request(App)
      .get('/api/v1/app')
      .set('Authorization', `Bearer 123123`)

    expect(response.status).toBe(401)

    done()
  })
})
