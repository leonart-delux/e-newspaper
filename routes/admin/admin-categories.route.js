import express from "express";
import categoryService from "../../services/categoryService.js";

const router = express.Router();

router.get('/', async function (req, res) {
    const categories = await categoryService.getAllCategoriesAndItsChildCat();
    if (req.session.categoryName === null) {
        res.render('vwAdmin/categories/categories-menu', {
            layout: 'admin',
            categories: true,
            categoryList: categories,

        });
    } else {
        res.render('vwAdmin/categories/categories-menu', {
            layout: 'admin',
            categories: true,
            categoryList: categories,
            deleted: req.session.categoryDeleted,
            categoryName: req.session.categoryName,
        });
        req.session.categoryDeleted = null;
        req.session.categoryName = null;
    }
});

router.get('/add', async function (req, res) {
    res.render('vwAdmin/categories/categories-add', {
        layout: 'admin',
        categories: true,
    });
});

router.post('/add', async function (req, res) {
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

router.get('/delete', async function (req, res) {
    const catId = +req.query.catId;
    req.session.categoryName = 'Unknown'
    if (catId >= 1) {
        const category = await categoryService.getCategory(catId);
        req.session.categoryName = category.name;
    }

    const ret = await categoryService.deleteCategory(catId);
    const categories = await categoryService.getAllCategoriesAndItsChildCat();
    req.session.categoryDeleted = ret;

    res.redirect('/admin/categories');


});
export default router;