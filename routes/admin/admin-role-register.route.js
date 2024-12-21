import express from "express";

const router = express.Router();

router.get('/', async function (req, res) {
    res.render('vwAdmin/role-register/role-register-menu', {
        layout: 'admin',
        role: true,
    });
});

export default router;