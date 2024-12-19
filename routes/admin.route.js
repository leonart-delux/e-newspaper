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
    res.render('vwAdmin/categories/categories-menu', {
        layout: 'admin',
        categories: true,
        categoryList: categories,
        // title:'Category'
    });
});

router.get('/categories/add', async function (req, res) {
    res.render('vwAdmin/categories/categories-add', {
        layout: 'admin',
        categories: true,
    });
});

router.post('/categories/add', async function (req, res) {
    const childCats = req.body.childCats;
    const categoryName = req.body.categoryName;
    const ret = await categoryService.addCategories(categoryName, childCats);
    res.render('vwAdmin/categories/categories-add', {
        layout: 'admin',
        categories: true,
        added: ret,
        catName: categoryName,

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