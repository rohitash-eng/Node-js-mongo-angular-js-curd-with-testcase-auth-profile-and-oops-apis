const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../Models/UserModel')

class SessionController {
  async store (req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email }).select('+password')      
      if (!user) {
        return res.status(400).send({ error: 'user not found' })
      }
      if (!user.active) {
        return res.status(400).send({ error: 'You have not verify your email yet! Please verify your email.' })
      }
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ error: 'invalid password' })
      }
      res.send({ user, token: await user.generateAuthToken() })
    } catch (error) {
      return res.status(500).send({ error })
    }
  }
  async logout (req, res) { // LOGOUT A USER
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
  }
  async logoutAll (req, res) { // LOGOUT FROM ALL DEVICES
    try {
      req.user.tokens = []
      await req.user.save()
      res.send()
    } catch (e) {
        res.status(500).send()
    }
  }
}

module.exports = new SessionController()
