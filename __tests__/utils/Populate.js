const faker = require('faker')
const User = require('../../src/App/Models/UserModel')

class Populate {
  async users (quantity) {
    let users = []

    for (let i = 0; i < quantity; i++) {
      let user = await User.create({
        fullName: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      })

      users = [...users, user]
    }

    return users
  }
}
module.exports = new Populate()
