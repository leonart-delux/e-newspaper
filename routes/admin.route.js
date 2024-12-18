import express from "express";
import categoryService from "../services/categoryService.js";

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwAdmin/dashboard', {
        layout: 'admin',
        dashboard: true,

    });
});

router.get('/categories', async function (req, res) {

    const categories = await categoryService.getAllCategoriesAndItsChildCat();


    res.render('vwAdmin/categories-menu', {
        layout: 'admin',
        categories: true,
        categoryList: categories,

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