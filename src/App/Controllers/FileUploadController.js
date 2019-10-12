const User = require('../Models/UserModel')
const sharp = require('sharp')
class FileUploadController 
{
  async fileUpload (req,res) { // FILE UPLOAD 
    try{
      const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
      await User.updateOne({ _id: req.user._id }, {$set:{ original_profile_image: req.file.buffer, avatar: buffer}});
      return res.send({status:200,"message":"File has been uploaded."});
    }catch(error){
      return res.send({status:400,"message":"File not save."});  
    }
  }

  customError (error,req,res,next) { // FILE CUSTOM ERROR MESSAGE    
    return res.send({status:400,"message":error.message});  
  }
  async getProfileImage (req,res) { // GET PROFILE 
    try{
      const user = await User.findById(req.params.id);
      res.set("Content-Type","image/png");
      if(!user || !user.avatar){
         user.avatar = null
      }      
      return res.send(user.avatar);
    }catch(error){
      return res.send({status:400,"message":"File not save."});  
    }
  }
}
module.exports = new FileUploadController()
