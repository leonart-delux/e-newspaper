import express from "express";
import adminCategoriesRoute from "./admin-categories.route.js";
import adminTagsRoute from "./admin-tags.route.js";

const router = express.Router();

router.use('/categories', adminCategoriesRoute);

router.use('/tags', adminTagsRoute);





router.get('/', function (req, res) {
    res.render('vwAdmin/dashboard', {
        layout: 'admin',
        dashboard: true,

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