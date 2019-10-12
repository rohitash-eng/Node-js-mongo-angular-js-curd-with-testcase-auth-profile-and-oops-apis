const User = require('../../src/App/Models/UserModel')

class Trucate {
  async users () {
    await User.deleteMany()
  }
}

module.exports = new Trucate()
