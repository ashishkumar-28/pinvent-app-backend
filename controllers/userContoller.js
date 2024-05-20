const asyncHandler=require("express-async-handler");
const User=require("../models/userModel");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const Token=require("../models/tokenModel");
const crypto=require("crypto");
const sendEmail = require("../utils/sendEmail");

//Generate Token
const generateToken =(id)=>{ //it helps to login registered user and it also use to keep the user login upto the given time
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"1d"});

};

//Register User
const registerUser = asyncHandler ( async(req,res)=> {
    const {name,email,password} =req.body;


    //Validation
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")

    }

    if(password.length<6)
    {

        res.status(400)
        throw new Error("Password must be up to 6 characters")
    }

    //Check If user Email already exists

    const userExists = await User.findOne({email})

    if(userExists)
    {
        res.status(400)
        throw new Error("Email has already been registered")
    }


    //Create a new User
    const user=await User.create({
        name,  //name:name
        email,
        password,
    })

    
    //Generate Token

    const token = generateToken(user._id);

    //Send HTTP-only cookie
    res.cookie("token",token,{
        path:"/", //it tells the path where the cookie will store default is "/" which is home page
        httpOnly:true, //it is boolean parameter that tell cookie will only used for web server
        expires:new Date(Date.now() + 1000 * 86400), //for one day formula //here expires used for when the cookie will expire
        sameSite:"none", //here we use this because we will deploy our frontend on different site and backend on different site
        secure:true, //it marks cookie is used only for https

    });


    if(user){  //if user greated sucessfully then it will return below things
        const {_id,name,email,photo,phone,bio}=user
        res.status(201).json({// 201 speciifies new data created
            // _id:user.id, //here mongo db will attached id for new user
            // name:user.name

            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });   
    } else{ //when data cant be saved or info doesn't add to database
        res.status(400)
        throw new Error("Invalid User Data !!")
    }

  
});

//Login User

const loginUser= asyncHandler(async(req,res)=>{
   const {email,password}=req.body

   //Validate Request

   if(!email || !password)
    {
        req.status(400);
     throw new Error("Please add email and password");

    }

    //Check if user exists 

    const user=await User.findOne({email})
    
    if(!user){
        res.status(400);
        throw new Error("User not found, Please SignUp !!");
    }

    //User Exists, Now check the password is correct or not

    const passwordIsCorrect=await bcrypt.compare(password,user.password);
  
   //Generate Token

   const token = generateToken(user._id);

   //Send HTTP-only cookie
   res.cookie("token",token,{
       path:"/", //it tells the path where the cookie will store default is "/" which is home page
       httpOnly:true, //it is boolean parameter that tell cookie will only used for web server
       expires:new Date(Date.now() + 1000 * 86400), //for one day formula //here expires used for when the cookie will expire
       sameSite:"none", //here we use this because we will deploy our frontend on different site and backend on different site
       secure:true, //it marks cookie is used only for https

   });


    if(user && passwordIsCorrect){

        const {_id,name,email,photo,phone,bio}=user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
            
        });   
    }else{
        res.status(400);
        throw new Error("INVALID USERNAME AND PASSWORD !!");
    }
});

//logout User

const logout =asyncHandler (async(req,res)=>{

    // TO LOGOUT user we will expire the cookie
    //Send HTTP-only cookie
   res.cookie("token","",{ //here we are not saving any token so we pass empty string
    path:"/",
    httpOnly:true, 
    expires:new Date(0), //it will expire the cookie
    sameSite:"none", 
    secure:true, 
    });

    return res.status(200).json({
        message:"Successfully Logged Out"
    });

});

//Get User Data

const getUser=asyncHandler (async(req,res)=>{
    const user=await User.findById(req.user._id)

    if(user){  
        const {_id,name,email,photo,phone,bio}=user;
        res.status(200).json({
           
            _id,
            name,
            email,
            photo,
            phone,
            bio,
           
        });   
    } else{ 
        res.status(400)
        throw new Error("User Not Found !!")
    }
    
});

//Get Login Status

const loginStatus =asyncHandler(async(req,res)=>{
   const token=req.cookies.token;
   if(!token){
    return res.json(false)
   }

   //VERIFY TOKEN
   const verified=jwt.verify(token,process.env.JWT_SECRET);

   if(verified){
    return res.json(true);
   }
   return res.json(false);
    
});

//Update User
const updateUser= asyncHandler(async(req,res)=>{
    const user =await User.findById(req.user._id)

    if(user){
        const {name,email,photo,phone,bio}=user;
        user.email=email; //here it means user cant change there name
        user.name=req.body.name || name ; //here we writtern or name because if user didn't updae name the previous name will be remain same
        user.phone=req.body.phone || phone ;
        user.bio=req.body.bio || bio ;
        user.photo=req.body.photo || photo ;

        const updatedUser=await user.save()

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,

        })
    }else{
        res.status(404)
        throw new Error("User not Found")
    }
});

//changePassword

const changePassword=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id);

    const{oldPassword,password}=req.body;

    if(!user){
        res.status(400);
        throw new Error("User not found, Please SignUp !!");
    }

    //VALIDATE
    if(!oldPassword || !password){
        res.status(400);
        throw new Error("Please add old and new Password");
    }

    //Check if old password matches password in database

    const passwordIsCorrect=await bcrypt.compare(oldPassword,user.password)

    //Save new password

    if(user && passwordIsCorrect){
        user.password=password
        await user.save()
        res.status(200).send("Password Change Successfull !!")

    }else{
        res.status(400);
        throw new Error("Old Password is not correct");
    }

});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User does not exist");
    }

    // Delete existing token if present
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    // Create a new reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // Hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token to database
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000 // 30 min
    }).save();

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Send email
    const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>
      <p>This reset link is valid for only 30 minutes.</p>
      <a href=${resetUrl}>${resetUrl}</a>
      <p>Regards</p>
      <p>Team Ashish</p>
    `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
        res.status(500);
        throw new Error("Email Not Sent, Please Try Again !!");
    }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;
  
    // HASH Token, then compare to Token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // Find Token in db
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });
  
    if (!userToken) {
      res.status(404);
      throw new Error("Invalid or Expired Token");
    }
  
    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
  
    // Update user's password
    user.password = password;
    await user.save();
  
    // Delete token after password reset
    await userToken.deleteOne();
  
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
  });
  

module.exports={
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,

}