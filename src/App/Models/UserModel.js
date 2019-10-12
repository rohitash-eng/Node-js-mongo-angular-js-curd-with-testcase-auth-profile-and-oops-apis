const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const jwt = require('jsonwebtoken')
const secret = require('../../Config/Secret').getSecret()
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim:true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim:true,
      validate(value){
          if(!validator.isEmail(value)){
              throw new Error('Email is invalid.')
          }
      }
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim:true,
      minlength:8,
      validate(value){
          if(value.toLowerCase().includes('password')){
              throw new Error('Password cannot contain "password".');
          }
      }
    },
    reset_password_token : {
      type: String,
      default:null
    },
    active: {
      type: Boolean,
      required: true,
      default: false
    },
    original_profile_image:{
      type:Buffer
    },
    avatar:{
      type:Buffer
    },
    tokens:[{
        token:{
            type:String
        }
    }]
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  const user = this;
  if(user.isModified('password')){
      user.password = await bcrypt.hash(user.password,8)
  }
  next()
})
UserSchema.methods.toJSON = function(){    
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.reset_password_token
  delete userObject.original_profile_image
  delete userObject.avatar
  // add a profile link
  //http://localhost:3000/api/v1/users/get-profile-image/5da1f0a2bb7ca11f4009e10c  
  return userObject
}
UserSchema.methods.generateAuthToken = async function () {  
  try {  
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, secret)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;
  }catch(error){
    return new Error("Please provide valid key!");
  }
}
module.exports = mongoose.model('User', UserSchema)
