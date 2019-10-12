const faker = require('faker')
const { factory } = require('factory-girl')
const User = require('../../../src/App/Models/UserModel')

class Factory {
  constructor () {
    factory.define('User', User, {
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    return factory
  }
}

module.exports = new Factory()
