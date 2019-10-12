const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../Models/UserModel')
const emailService = require('../../Services/Email');
const secret = require('../../Config/Secret').getSecret()
const url = require('url')
function generateJWTToken (params = {}) {
  return jwt.sign(params, secret, { expiresIn: '1h' })
}
class UserController {

  async store (req, res) { // REGISTER        
    try {        
        const user = new User(req.body)
        await user.save();
        const token = await user.generateAuthToken()        
        await User.updateOne({ _id: user._id }, {$set:{ reset_password_token: token }});
        return res.send({ user, token })
    } catch (error) {
        return res.status(500).send({ error })
    }
  }
  
  async profile (req, res) { // GET PROFILE
    res.send(req.user)
  }

  async update (req, res) { // UPDATE PROFILE
    const updates = Object.keys(req.body)
    const email = req.body.email;
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'email already exists' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
      return res.status(500).send({ error })
    }
  }
  async forgotPassword(req,res) { // FORGOT PASSWORD
    try {      
        if(!req.body.email){
          return res.status(400).send({ error: 'Please provide valid email.' });
        }
        const email = req.body.email;        
        const user = await User.findOne({ email,active:true }) //checking if the email address sent by client is present in the db(valid)
        if(!user){
          return res.status(400).send({ error: 'No user found with that email address.' });
        }        
        const token = await generateJWTToken({ id: user._id }) // GENERATE FORGOT PASSWORD RANDOM TOKEN
        await User.updateOne({ _id: user._id }, {$set:{ reset_password_token: token }});
        // EMAIL OPTIONS
        const link = 'http://localhost:3000/api/v1/api/reset-password?token=' + token
        const mailOptions = {
          user,
          link,
          subject:"Reset your account password",
          content:`<h4><b>Reset Password</b></h4><p>To reset your password, complete this form:</p>
          <a href="` + link + `"> Reset Password </a>
          <br><br><p>--Team</p>`
        }
        emailService.send(mailOptions)
        return res.send("Reset Email Link has been sent to your email address");        
    } catch (error) {
      console.log("Error " + error)
      return res.status(500).send({ error })
    }
  }
  async resetPassword(req,res) { // RESET PASSWORD 
    try {
        const {token,new_password,confirm_password} = req.body;
        if(!token){
          return res.status(401).send({ error: 'Please provide valid token.' });
        }        
        let decode_token = '';
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {                
                return res.status(401).json({"error": true, "message": 'Token has been expired.' });
            }
            decode_token = decoded          
        });        
        const user = await User.findOne({ _id: decode_token.id, 'reset_password_token': token })        
        if(!user){
          return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
        }
        if(new_password !== confirm_password){
          return res.status(401).json({"error": true, "message": 'New password and confirm password does not match.' });
        }
        const password_hash = await bcrypt.hash(new_password,8) 
        await User.updateOne({ _id: user._id }, {$set:{ password: password_hash }});
        return res.send({status:200,"message":"Your password has been changed. Please login with new password."});
    } catch (error) {
      console.log("Error " + error)
      return res.status(500).send({ error })
    }
  }
  async changePassword(req,res) { // CHANGE PASSWORD 
    try {
        const {current_password,new_password,confirm_password} = req.body;
        const user = await User.findOne({ email:req.user.email }).select('+password')        
        if (!(await bcrypt.compare(current_password, user.password))) {
          return res.status(400).send({ status:400,"message":'Current password does not match.' })
        }
        if(new_password !== confirm_password){
          return res.status(401).json({"error": true, "message": 'New password and confirm password does not match.' });
        }
        const confirm_password_hash = await bcrypt.hash(confirm_password,8) 
        await User.updateOne({ _id: user._id }, {$set:{ password: confirm_password_hash,reset_password_token:null }});
        return res.send({status:200,"message":"Your password has been changed."});        
    } catch (error) {
      console.log(error)      
      return res.status(500).send({ "status":500,"message": error})
    }
  }
  async verifyEmail(req,res) { // VERIFY EMAIL 
    try {
        const token  = req.body.token;
        if(!token){
          return res.status(401).send({ error: 'Email verify link is invalid.' });
        }        
        let decode_token = '';
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {                
                return res.status(401).json({"error": true, "message": 'Link has been expired.' });
            }
            decode_token = decoded          
        });        
        const user = await User.findOne({ _id: decode_token._id, 'reset_password_token': token })                
        if(!user){
          return res.status(401).json({"error": true, "message": 'Link has been expired.' });
        }
        if(user.active){
          return res.status(401).json({"error": true, "message": 'Email already verified.' });
        }
        await User.updateOne({ _id: user._id }, {$set:{ active: true }});
        return res.send({status:200,"message":"Thanks for verifying your email. Please login with us."});
    } catch (error) {
      console.log(error)      
      return res.status(500).send({ "status":500,"message": error})
    }
  }  
}
module.exports = new UserController()
