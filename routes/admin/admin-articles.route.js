import express from "express";
import articleService from "../../services/articleService.js";

const router = express.Router();

router.get('/', async function (req, res) {
    res.render('vwAdmin/articles/articles-menu', {
        layout: 'admin',
        articles: true,
    });
});

export default router;