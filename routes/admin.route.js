import express from "express";

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwAdmin/linechart', {
        layout: 'admin',
        dashboard: true,

    });
});

router.get('/categories', function (req, res) {
    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        categories: true,
    });
});

router.get('/tags', function (req, res) {
    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        tags: true,
    });
});

router.get('/articles', function (req, res) {
    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        articles: true,
    });
});
router.get('/users', function (req, res) {
    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        users: true,
    });
});

router.get('/role-registers', function (req, res) {
    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        role: true,
    });
});
export default router;