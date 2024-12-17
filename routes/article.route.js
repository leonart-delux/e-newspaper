import express from "express";
import categoryService from "../services/categoryService.js";

const router = express.Router();

router.get('', function (req, res) {
    res.render('vwHome/home', {
        layout: 'home',
    });
});
router.get('/cat',async function (req, res) {
    const catId = +req.query.catId || 6;

    const childCats =await categoryService.getChildCategories(catId);

    const category = await categoryService.getCategory(catId);

    console.log(childCats);
    console.log(category);


    res.render('vwHome/articleListByCat',{
        layout: 'home',
        mainCat: category,
        childCats: childCats,
    });
});

export default router;