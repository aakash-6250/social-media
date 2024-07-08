var express = require("express");
var router = express.Router();
const path = require('path')
const User = require("../models/user");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { registeredEmail, forgetEmail } = require('../utils/emailService');
const { uploadProfile, uploadPost } = require('../utils/multer');
const fs = require('fs')


passport.use(new LocalStrategy(User.authenticate()));

router.get("/", async function (req, res, next) {
    if (req.isAuthenticated()) return res.render('loginIndex', { user: req.user });
    else res.render("index", { user: req.user });
});

router.get("/register", isLogedOut, function (req, res, next) {
    res.render("register", { user: req.user });
});

router.post("/register", isLogedOut, async function (req, res, next) {
    try {
        const { name, username, email, password } = req.body;
        const otp = generateOTP();
        if (!name || !username || !email || !password) res.render('error', { message: 'Failed to create user', error: 'All fields are required.' });
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (existingUser) {
            if(existingUser.isVerified){
                if (existingUser.username == username) return res.render('error', { message: 'Failed to create user', error: 'Username already taken.' });
                if (existingUser.email == email) return res.render('error', { message: 'Failed to create user', error: 'Email already taken.' });
            }
            else registeredEmail(existingUser);
        }
        if (!existingUser) {
            const user = await User.register({ name, username, email, otp }, password)
            registeredEmail(user);
        }
        res.redirect("/verify-account/" + username);
    } catch (error) {
        console.error(error)
        if (error.code === 11000 && error.keyPattern.email === 1) {
            res.render('error', { message: 'Failed to create user', error: 'Email already exists. Please use a different email.' });
        } else {
            res.render('error', { message: 'Failed to create user', error: error.message });
        }
    }
});

router.get('/verify-account/:username', isLogedOut, async function (req, res, next) {
    try {
        const userExist = await User.findOne({ username: req.params.username });
        if (!userExist) {
            res.render('error', { message: "Account does not exist.", error: "User not exist to verify account." });
        }
        else if (userExist.isVerified) {
            res.redirect('/')
        }
        res.render('verify-account', { username: req.params.username });
    } catch (error) {
        console.error(error);
        res.render('error', { message: "Unable to verify account.", error: error.message })
    }
})

router.post('/verify-account/:username', isLogedOut, async function (req, res, next) {
    try {
        const otp = parseInt(req.body.otp);
        if (!otp) res.render('error', { message: "Unable to verify account.", error: "OTP is required." });
        const userExist = await User.findOne({ username: req.params.username });
        if (!userExist) res.render('error', { message: " Unable to verify account.", error: "User does not exist." });

        if (userExist.otp === otp) {
            userExist.isVerified = true;
            await userExist.save();
            req.logIn(userExist, function (err) {
                if (err) throw err;
                res.redirect('/');
            });
        }
        else res.render('error', { message: "Unable to verify account.", error: "Invalid otp provided." });
    } catch (error) {
        console.error(error)
        res.render('error', { message: "Unable to verify account.", error: error.message });
    }
})

router.get("/profile", isLoggedIn, function (req, res, next) {
    res.render("profile", { user: req.user });
});

router.get("/login", isLogedOut, function (req, res, next) {
    res.render("login", { user: req.user });
});

router.post("/login", isLogedOut, async function (req, res, next) {
    try {
        passport.authenticate("local", async function (err, user, info) {
            if (err) throw err;

            if (!user) return res.redirect("/login");

            if (!user.isVerified) return res.redirect("/verify-account/" + user.username);

            req.logIn(user, function (err) {
                if (err) throw err;

                return res.redirect("/");
            });
        })(req, res, next);
    } catch (error) {
        console.error("Error during login:", error);
        return res.render("error", { message: "Unable to login", error: error.message });
    }
});

router.get("/forget-password", isLogedOut, function (req, res, next) {
    res.render("forgetPassword", { user: req.user })
});

router.post("/forget-password", isLogedOut, async function (req, res, next) {
    try {
        const { email } = req.body;
        const user = User.findBy({ email: email })
        console.log(user)
        res.redirect("/login");
    } catch (error) {
        console.error(error)
        res.render('error', { message: 'Failed to create user', error: error.message });
    }
});


router.get("/edit-profile", isLoggedIn, function (req, res, next) {
    res.render("edit-profile", { user: req.user });
})

router.post('/edit-profile/:username', uploadProfile, async function (req, res, next) {
    try {
        const { name, username, bio, oldpassword, newpassword } = req.body;
        const user = await User.findByUsername(req.params.username);
        if (!user) res.status(404).render('error', { message: "Profile not updated.", error: "User not found." });
        if (req.file) {
            if (!user.profile) user.profile = req.file.filename;
            else {
                fs.unlinkSync(path.join("public", "images", "profile", user.profile));
                user.profile = req.file.filename;
            }
        }
        if (name) {
            user.name = name;
        }
        if (username) {
            user.username = username;
        }
        console.log(bio)
        if (bio) {
            user.bio = bio;
        }

        user.save()

        if (newpassword) {
            if (!oldpassword) res.render('error', { message: "Profile not updated.", error: "Old password is required to change password." });
            if (newpassword === oldpassword) res.render('error', { message: "Profile not updated.", error: "Old password and new password should not be same." });
            user.changePassword(oldpassword, newpassword);
        }

        res.redirect('/edit-profile')
    } catch (error) {
        console.error(error);
        res.render('error', { message: "Profile not update.", error: error.message })
    }
})

router.get('/logout', function (req, res, next) {
    req.logout(() => {
        res.redirect("/");
    });
});

router.get('/delete-account/:id', async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        fs.unlinkSync(path.join("public", "images", "profile", user.profile));
    } catch (error) {
        console.error(error)
        res.redirect('/edit-profile')
    }
})



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function isLogedOut(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


function generateOTP() {
    const otpLength = 6;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}


module.exports = router;