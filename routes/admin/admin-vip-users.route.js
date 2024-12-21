import express from "express";

const router = express.Router();
router.get('/', function (req, res) {
    res.render('vwAdmin/vip-users/vip-users-menu',{
        layout: 'admin',
        vipUsers: true,
    })
});
export default router;