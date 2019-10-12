const express = require('express')

const UserController = require('../App/Controllers/UserController')
const SessionController = require('../App/Controllers/SessionController')
const AuthMiddleware = require('../App/Middlewares/Authenticate')
const FileUploadController = require('../App/Controllers/FileUploadController')
const FileUploadMiddleware = require('../App/Middlewares/FileUpload')

class Routes {
  publicRoutes () {
    const routes = express.Router()
    routes.post('/sessions', SessionController.store) // LOGIN        
    routes.post('/users', UserController.store) // REGISTER    
    routes.put('/users/verify-email', UserController.verifyEmail) // VERIFY EMAIL
    routes.post('/users/forgot-password', UserController.forgotPassword) // FORGOT PASSWORD
    routes.put('/users/reset-password', UserController.resetPassword) // RESET YOUR PASSWORD    
    routes.get('/users/get-profile-image/:id', FileUploadController.getProfileImage) // GET PROFILE IMAGE AS LINK
    
    return routes
  }

  privateRoutes () {
    const routes = express.Router()
    routes.use(AuthMiddleware.verifyToken)
    routes.get('/sessions/logout', SessionController.logout) // LOGOUT A USER
    routes.get('/sessions/logout-all', SessionController.logoutAll) // LOGOUT FROM ALL
    routes.get('/users/me', UserController.profile) // GET PROFILE
    routes.put('/users/me', UserController.update) // UPDATE PROFILE
    routes.post('/users/change-password', UserController.changePassword) // CHANGE YOUR PASSWORD
    routes.post('/uploads/file-upload', FileUploadMiddleware, FileUploadController.fileUpload,FileUploadController.customError) // FILE UPLOAD
    
    routes.get('/app', (req, res) => {
      res.send({
        app: 'app'
      })
    })

    return routes
  }
}

module.exports = new Routes()
