const dotenv=require("dotenv").config();
const express=require("express");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const cors=require("cors");
const userRoute=require("./routes/userRoute") ;
const productRoute=require("./routes/productRoute");
const contactRoute=require("./routes/contactRoute");
const errorHandler=require("./middleWare/errorMiddleware");
const cookieParser =require("cookie-parser");
const path=require("path"); 


const app=express()

//Middlewares

app.use(express.json()); //help to handle json data in application
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));  //helps to handle the data via url
app.use(bodyParser.json());
app.use(cors({
    origin:["http://localhost:3000","https://pinvent-app.vercel.app"],
    credentials:true,
}));

app.use("/uploads",express.static(path.join(__dirname,"uploads")));

//Routes Middleware
app.use("/api/users",userRoute) // route for user registeration
app.use("/api/products",productRoute);
app.use("/api/contactus",contactRoute);

//Routes
app.get("/",(req,res)=>{
    res.send("Home Page");
});

// ERROR  MIDDLEWARE

app.use(errorHandler);


//Connect to Mongo DB and Start server
const PORT=process.env.PORT || 5000;

mongoose
        .connect(process.env.MONGO_URI)
        .then(()=>{
            app.listen(PORT,()=>{
                console.log(`Server running on port ${PORT}`)
            })
        })
        .catch((err)=console.log)