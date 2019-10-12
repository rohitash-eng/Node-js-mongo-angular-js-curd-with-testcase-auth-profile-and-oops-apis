require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
}) //Dotenv is a zero-dependency module that loads environment variables

const express = require('express')
const cors = require('cors') // using "Cross Origin Resource Sharing" handle Cross domain requests
const cookieParser = require('cookie-parser') // providing simple cookie parsing functionality for signed cookie or not signed cookie
const logger = require('morgan') // it generates logs automatically.

const Database = require('./Database/Database')
const Routes = require('./Routes/Routes')

class App {
  constructor () {
    this.app = express()

    this.database()
    this.middlewares()
    this.routes()
  }

  database () {
    Database.connection()
  }

  middlewares () {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true })) //If extended is true, means you can post "nested object"
    this.app.use(logger('dev'))
    this.app.use(cookieParser())
    this.app.use(cors())
  }

  routes () {
    this.app.use('/api/v1', Routes.publicRoutes())
    this.app.use('/api/v1', Routes.privateRoutes())
  }
}

module.exports = new App().app
