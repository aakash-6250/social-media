const path = require('path');
const nodemailer = require("nodemailer");
const ejs = require('ejs');



const sendEmail = async (user) => {
    try {
        const renderedHtml = await ejs.renderFile(path.join(__dirname, "..", "views", "email", "email.ejs"), { user: user });
        const transporter = nodemailer.createTransport({
            host: process.env.emailHost,
            port: 465,
            secure:true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailPass,
            },
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

module.exports = sendEmail;
