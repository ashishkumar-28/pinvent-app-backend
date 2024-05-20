const nodemailer=require("nodemailer");

const sendEmail=async(subject,message,send_to,sent_from,reply_to)=>{

//Create email transportor
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:587,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,

        },
        //it is not compulsory used only for problems like email were not ending
        tld:{
            rejectUnauthorized:false
        }
    })

    //Options for sending email

    const options={
        from: sent_from,
        to: send_to,
        replyTo:reply_to,
        subject:subject,
        html:message,
    }


    //Send Email

    transporter.sendMail(options,function(err,info){//if the mail was send successfully it was in info parameter if its error then err parameter
        if(err){
            console.log(err)
        }else{
        console.log(info)
        }

    }) 

};

module.exports=sendEmail;
