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
            deleted: null,
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

router.get('/edit', async function (req, res) {
    let catId = +req.query.catId || null;
    if (req.session.editedCatId !== null && req.session.editedCatId !== undefined) {
        catId = req.session.editedCatId;
    }
    if (!catId || catId <= 0 ) {
        res.redirect('/admin/categories');
    }
    const category = await categoryService.getCategoryAndItsChildCat(catId);
    if (req.session.edited === null || req.session.edited === undefined) {
        res.render('vwAdmin/categories/categories-edit', {
            layout: 'admin',
            category: category,
            catId: catId,
            edited: null,
        });
    } else if (req.session.edited === true) {
        res.render('vwAdmin/categories/categories-edit', {
            layout: 'admin',
            category: category,
            catId: req.session.editedCatId,
            edited: true,
            catName: req.session.editedCatName,
        });
    } else if (req.session.edited === false) {
        res.render('vwAdmin/categories/categories-edit', {
            layout: 'admin',
            category: category,
            catId: req.session.editedCatId,
            edited: false,
            catName: req.session.editedCatName,
        });
    }
    req.session.edited = null;
    req.session.editedCatName = null;
    req.session.editedCatId = null;
});

router.post('/edit', async function (req, res) {
    const childCats = req.body.childCats || null;
    const categoryNewName = req.body.categoryName;
    const catId = +req.body.catId;

    const ret = await categoryService.updateCategoryAndItsChildCat(catId, childCats, categoryNewName);
    req.session.editedCatName = categoryNewName;
    req.session.editedCatId = catId;
    if (!ret) {
        req.session.edited = null;
    } else {
        req.session.edited = true;
    }
    res.redirect('/admin/categories/edit');
});
export default router;