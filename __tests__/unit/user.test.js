/* eslint-disable */
const request = require('supertest')
const bcrypt = require('bcryptjs')

const App = require('../../src/App')
const Trucate = require('../utils/Trucate')
const Factory = require('../utils/Factory/User')
const Populate = require('../utils/Populate')

describe('User', () => {
  beforeEach(async done => {
    await Trucate.users()
    done()
  })

  it('should created a user', async done => {
    const response = await request(App)
      .post(`/api/v1/users`)
      .send({
        fullName: 'Rohitash Singh',
        email: 'abcxyz005@yopmail.com',
        password: '123456'
      })

    expect(response.status).toBe(200)

    done()
  })

  it('should not created a user whit same emails', async done => {
    let response = await request(App)
      .post(`/api/v1/users`)
      .send({
        fullName: 'rohit',
        email: 'abcxyz005@yopmail.com',
        password: '123456'
      })

    expect(response.status).toBe(200)

    response = await request(App)
      .post(`/api/v1/users`)
      .send({
        fullName: 'Mohan',
        email: 'abcxyz005@yopmail.com',
        password: '123456'
      })

    expect(response.status).toBe(400)

    done()
  })

  it('should encrypt user password', async done => {
    const user = await Factory.create('User', {
      password: 'mypass123'
    })

    const compareHash = await bcrypt.compare('mypass123', user.password)

    expect(compareHash).toBe(true)

    done()
  })

  it('should return a array of users', async done => {
    await Populate.users(3)

    const response = await request(App).get('/api/v1/users')

    expect(response.status).toBe(200)

    done()
  })

  it('should return one user', async done => {
    const user = await Factory.create('User', {
      fullName: 'Foo'
    })

    const response = await request(App).get(`/api/v1/users/${user._id}`)

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty('fullName', 'Foo')

    done()
  })

  it('should update a full name user', async done => {
    const user = await Factory.create('User')

    const response = await request(App)
      .put(`/api/v1/users/${user._id}`)
      .send({
        fullName: 'Doe'
      })

    expect(response.status).toBe(200)

    done()
  })

  it('should update a email user', async done => {
    const user = await Factory.create('User')

    const response = await request(App)
      .put(`/api/v1/users/${user._id}`)
      .send({
        email: 'test@email.com'
      })

    expect(response.status).toBe(200)

    done()
  })

  it('should update a user password', async done => {
    const user = await Factory.create('User')

    const response = await request(App)
      .put(`/api/v1/users/${user._id}`)
      .send({
        password: 'mypass'
      })

    expect(response.status).toBe(200)

    done()
  })

  it('should not update when user not found', async done => {
    const response = await request(App)
      .put('/api/v1/users/000000000000000000000000')
      .send({
        fullName: 'Foo'
      })

    expect(response.status).toBe(400)

    done()
  })

  it('should not update email when alredy exists', async done => {
    await Factory.create('User', {
      email: 'test@email.com'
    })

    const user = await Factory.create('User', {
      email: 'test2@email.com'
    })

    const response = await request(App)
      .put(`/api/v1/users/${user._id}`)
      .send({
        email: 'test@email.com'
      })

    expect(response.status).toBe(400)

    done()
  })

  it('should delete a user', async done => {
    const user = await Factory.create('User')

    let response = await request(App).delete(`/api/v1/users/${user._id}`)

    expect(response.status).toBe(200)

    response = await request(App).get(`/api/v1/users/${user._id}`)

    expect(response.status).toBe(400)

    done()
  })

  it('should not delete a user when not found', async done => {
    const response = await request(App).delete(
      `/api/v1/users/000000000000000000000000`
    )

    expect(response.status).toBe(400)

    done()
  })
})
