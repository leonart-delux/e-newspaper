import express from "express";

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('account/information');
});

router.get('/information', function (req, res) {
    res.render('vwAccount/information',{
        layout:'account'
    });
});

export default router;