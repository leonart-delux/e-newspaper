import express from "express";
import categoryService from "../services/categoryService.js";


const router = express.Router();

router.get('/category/get-all-category-names', async function (req, res) {
    let categories = await categoryService.getAllCategories()
    return res.json(categories);
});

export default router;