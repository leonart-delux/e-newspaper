import express from 'express';
import bcrypt from 'bcryptjs';
import moment from 'moment';

const router = express.Router();

router.get("/login-register", (req, res) => {
    res.render("vwAccount/login-register", {
        title: "Login/Register", 
        layout: "main", 
    });
});

router.get("/forgot-password", (req, res) => {
    res.render("vwAccount/forgot-password", {
        title: "Forgot Password", 
        layout: "main", 
    });
});

export default router;