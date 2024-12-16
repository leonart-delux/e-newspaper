import express from 'express';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import authService from '../services/auth.service.js';

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get("/login-register", (req, res) => {
    res.render("vwAccount/login-register", {
        title: "Login/Register", 
        layout: "main", 
    });
});

router.post("/login-register", async (req, res) => {
    const formType = req.body.formType;
    if (formType === "login") {
        const user = await authService.findByEmail(req.body.email);
        
        if (!user) {
            return res.render("vwAccount/login-register", {
                title: "Login/Register", 
                layout: "main", 
                has_errors: true,
                message: "Email không tồn tại."
            });
        }

        if (!user.password) {
            return res.render("vwAccount/login-register", {
                title: "Login/Register", 
                layout: "main", 
                has_errors: true,
                message: "Có lỗi xảy ra trong việc xác thực mật khẩu."
            });
        }

        const ret = bcrypt.compareSync(req.body.password, user.password);
        if (!ret) {
            return res.render("vwAccount/login-register", {
                title: "Login/Register", 
                layout: "main", 
                has_errors: true,
                message: "Mật khẩu không đúng."
            });
        }

        res.redirect("/");
    } 
    if (formType === "register") {
        const hash_password = bcrypt.hashSync(req.body.password, 8);
        const entity = {
            password: hash_password,
            email: req.body.email,
            role: "guest",
        };
        const ret = await authService.add(entity);

        res.redirect("/login-register");
    }
});

router.get("/forgot-password", (req, res) => {
    res.render("vwAccount/forgot-password", {
        title: "Forgot Password", 
        layout: "main", 
    });
});

export default router;