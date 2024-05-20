const express=require("express");
const { registerUser, 
        loginUser, 
        logout, 
        getUser, 
        loginStatus,
        updateUser,
        changePassword,
        forgotPassword,
        resetPassword} = require("../controllers/userContoller");
const protect = require("../middleWare/authMiddleware");
const router=express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logout);
router.get("/getuser",protect,getUser);
router.get("/loggedin",loginStatus);
router.patch("/updateUser",protect,updateUser);
router.patch("/changePassword",protect,changePassword);
router.post("/forgotPassword",forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
// here we want to data 1. params which is in url and 2. reset token 
// :resetToken is a route parameter defined in Express.js.
// For example, if you make a PUT request to /resetPassword/abc123, then req.params.resetToken will be "abc123".

module.exports=router;
