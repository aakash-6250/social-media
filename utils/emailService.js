const path = require('path');
const nodemailer = require("nodemailer");
const ejs = require('ejs');



const registeredEmail = async (user) => {
    try {
        const renderedHtml = await ejs.renderFile(path.join(__dirname, "..", "views", "email", "registeredEmail.ejs"), { user: user });
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.user_email,
                pass: process.env.user_password,
            },
            // host: process.env.emailHost,
            // port: 465,
            // secure: true,
            // auth: {
            //     user: process.env.emailUser,
            //     pass: process.env.emailPass,
            // },
        });

        const info = await transporter.sendMail({
            from: process.env.emailUser,
            to: user.email,
            subject: "Account verification code",
            html: renderedHtml
        });
    } catch (err) {
        console.error("Error sending email:", err);
    }
};


const forgetEmail = async (user) => {
    try {
        const renderedHtml = await ejs.renderFile(path.join(__dirname, "..", "views", "email", "registeredEmail.ejs"), { user: user });
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.user_email,
                pass: process.env.user_password,
            },
            // host: process.env.emailHost,
            // port: 465,
            // secure:true,
            // auth: {
            //     user: process.env.emailUser,
            //     pass: process.env.emailPass,
            // },
        });

        const info = await transporter.sendMail({
            from: process.env.emailUser,
            to: user.email,
            subject: "Account verification code",
            html: renderedHtml
        });
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

module.exports = { registeredEmail, forgetEmail };
