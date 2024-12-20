import express from "express";
import categoryService from "../services/categoryService.js";


const router = express.Router();

router.get('/get-all-category-names', async function (req, res) {
    let categories = await categoryService.getAllNonParentCategories()
    return res.json(categories);
});

router.get('/get-child-categories', async function (req, res) {
    const catId = +req.query.catId;

    const childCats = await categoryService.getChildCategories(catId);

    let categories = await categoryService.getAllCategories();

    let nonParentcategories = await categoryService.getAllNonParentCategories();

    console.log(childCats);
    if (childCats.length !== 0) {
        categories = categories.map((category => {
            category.selected = childCats.some(childCat => childCat.id === category.id);
            return category;
        }));
    }

    console.log(catId);
    categories= categories.filter((category) => {
        return category.selected === true || nonParentcategories.some(nonParentCategory => nonParentCategory.id === category.id);
    })
    categories = categories.filter((category) => category.id !== catId);


    return res.json(categories);


});

export default router;