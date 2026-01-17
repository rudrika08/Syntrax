const express = require('express');
const router=express.Router();
//User
const signUp=require('../controller/User/SignUp');
const login=require('../controller/User/Login');
const googleAuth=require('../controller/User/GoogleAuth');
const UserDetails=require('../controller/User/UserDetails');
const authToken = require('../middlewares/authToken');
const userLogOut=require('../controller/User/Logout');
const refreshToken=require('../controller/User/RefreshToken');
const updateProfile=require('../controller/User/UpdateProfile');
//Blog
const BlogFetch=require('../controller/Blog/BlogFetch');
const BlogCreate=require('../controller/Blog/BlogCreate');
const BlogFetchById=require('../controller/Blog/BlogFetchById');
const BlogDelete=require('../controller/Blog/BlogDelete');
const blogFetchByBlogId=require('../controller/Blog/BlogFetchByBlogId');
const blogUpdate=require('../controller/Blog/BlogEdit');
//AI
const generateContent=require('../controller/AI/GenerateContent');
const generateImage=require('../controller/AI/GenerateImage');


//User
router.post('/signup',signUp);
router.post('/login',login);
router.post('/auth/google',googleAuth);
router.post('/refresh-token',refreshToken);
router.get('/userdetails',authToken,UserDetails);
router.put('/updateProfile',authToken,updateProfile);
router.get('/logout',authToken,userLogOut);

//Blog
router.get('/blog',BlogFetch);
router.post('/blogCreate',authToken,BlogCreate);
router.get('/blogFetchById',authToken,BlogFetchById);
router.delete('/blogDelete',authToken,BlogDelete);
router.post('/blogFetchByBlogId',blogFetchByBlogId);
router.put('/blogUpdate',authToken,blogUpdate);

//AI
router.post('/ai/generate',authToken,generateContent);
router.post('/ai/generate-image',authToken,generateImage);


module.exports=router;