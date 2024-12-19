import express from "express";

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwAdmin/linechart',{
        layout: 'home',
    });
});

router.get('/categories', function (req, res) {

});
export default router;