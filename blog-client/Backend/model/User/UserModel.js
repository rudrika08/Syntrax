const mongoose=require('mongoose');

const UserSchema= new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:false}, // Not required for Google OAuth users
    email:{type:String,sparse:true}, // Optional, for Google users
    googleId:{type:String,sparse:true}, // Google OAuth ID
    profilePicture:{type:String}, // Google profile picture
    authProvider:{type:String,enum:['local','google'],default:'local'}
},{
    timestamps:true
})

module.exports=mongoose.model('User',UserSchema)