const mongoose=require("mongoose")
const bcrypt=require("bcryptjs");

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please add a name"],

    },

    email:{
        type:String,
        required:[true,"Please add a email"],
        unique:true,
        trim:true, //remove space around the email
        match:[  //to validate email here we are using regex
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please Enter A Validate Email"
        ],
    },

    password: {
        type:String,
        required:[true,"Please add a password"],
        minLemgth:[6,"Password must be up to 6 characters"],
        // maxLength:[23,"Password must not be more than 23 character"],
    },
    
    photo: {
        type:String,
        required:[true,"Please add a photo"],
        default:"https://i.ibb.co/4pDNDk1/avtar.png",

    },

    phone: {
        type:String,
        default:"+91",
    },

    bio: {
        type:String,
        default:"bio",
        maxLength:[250,"Bio must not be more than 250 characters"],
    },
},{
    timestamps:true,
});

//Encrypt password before saving to DB

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }

    //Hash Password
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(this.password,salt);
    this.password=hashedPassword;
    next()


})

const User =mongoose.model("User",userSchema);
module.exports=User;