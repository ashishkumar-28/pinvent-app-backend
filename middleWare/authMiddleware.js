const asyncHandler=require("express-async-handler");
const User=require("../models/userModel");
const jwt=require("jsonwebtoken");

const protect=asyncHandler (async(req,res,next)=>{
    try {
        //first we will check is token(cookie) available in request(which we are gettinf from frontend) or not
        const token=req.cookies.token
        if(!token){
            res.status(410)
            throw new Error("Not Authorized, Please Login !!")
        }

        //If request came with token we will
        //VERIFY TOKEN

        const verified=jwt.verify(token,process.env.JWT_SECRET);

        //Get USER ID from token (because we created the token with id)

       const  user =await User.findById(verified.id).select("-password") //select used to not send the password

        if(!user){
            res.status(401)
            throw new Error("User not found")

        }
        //If user found in database
        req.user=user
        next();
    } catch (error) {
        res.status(401)
        throw new Error("Not authorized,Please Login")
        
    }
});

module.exports=protect;