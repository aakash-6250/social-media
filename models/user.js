const mongoose = require("mongoose");
const plm = require('passport-local-mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Name is required"],
            minLength: [4, "Name must be atleast 4 characters long."],
            maxLength: [20, "Name must be atmost 25 characters long."]
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Username is required."],
            minLength: [4, "Username must be atleast 4 characters long"],
            maxLength: [16, "Username must be atmost 16 characters long."],
            match: [/^[a-zA-Z0-9_-]{4,16}$/,"Username must be alphanumeric and can contain _ and -."]
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
            required: [true, "Email is required."],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter valid email address.",
            ]
        },
        bio:{
            type: String,
            trim: true
        },
        profile:{
            type: String,
            default: "default.webp"
        },
        otp: {
            type: Number
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        forgotPassword: {
            type: Boolean,
            default: false
        },
        forgotPasswordUrl: {
            type: String
        }
    },
    { timestamps: true }
);

userSchema.plugin(plm);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;