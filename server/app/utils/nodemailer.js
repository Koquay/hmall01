"use strict";
const nodemailer = require("nodemailer");

exports.sendEmail = async (msg) => {
    try {
        var transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", 
            secure: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_SENDER_PWD,
            },
        });


        let info = await transporter.sendMail({
            from: '"Ardene" <kkwilson27@hotmail.com>', // sender address
            to: `${msg.to}`, // list of receivers
            subject: `${msg.subject}`,
            // text: `${msg.text}`, 
            html: `${msg.text}`
        });

        console.log("Message sent: %s", info.messageId);
 
    } catch(error) {
        console.log('error', error);
        throw new Error('Problems sending user email')
    }
    
}
