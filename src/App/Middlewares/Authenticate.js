const jwt = require('jsonwebtoken')
const secret = require('../../Config/Secret').getSecret()
const { promisify } = require('util')
const User = require('../Models/UserModel')

class Authenticate {
  async verifyToken (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        if (!token) {
          return res.status(401).send({ error: 'no token provided' })
        }
        const decoded = jwt.verify(token,secret)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
          return res.status(401).send({ error: 'Token invalid' })
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
      return res.status(401).json({ error: 'Token invalid' })
    }
  }
}

module.exports = new Authenticate()
