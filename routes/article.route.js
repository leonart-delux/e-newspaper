import express from "express";

const router = express.Router();

router.get('', function (req, res) {
    res.render('vwHome/home', {
        layout: 'home',
    });
});
router.get('/cat', function (req, res) {
    res.render('vwHome/articleListByCat',{
        layout: 'home',
    });
});

export default router;