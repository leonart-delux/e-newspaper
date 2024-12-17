import express from "express";
import categoryService from "../services/categoryService.js";
import articleService from "../services/articleService.js";
import tagService from "../services/tagService.js";

const router = express.Router();

router.get('', function (req, res) {
    res.render('vwHome/home', {
        layout: 'home',
    });
});

router.get('/cat', async function (req, res) {
    const catId = +req.query.catId || 6;
    const limit = 2;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const childCats = await categoryService.getChildCategories(catId);

    const category = await categoryService.getCategory(catId);

    const articlesByCat = await articleService.getArticlesByCat(catId, limit, offset);

    const totalArticles = await articleService.countByCatId(catId);

    const nPages = Math.ceil(totalArticles.quantity / limit);
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
        page_items.push({
            value: i,
            active: i === +page,
        })
    }
    console.log(page_items.length);

    const prevPage = page === 1 ? page_items.length : page - 1;
    const nextPage = page === page_items.length ? 1 : page + 1;
    res.render('vwHome/articleListByCat', {
        layout: 'home',
        mainCat: category,
        childCats: childCats,
        articles: articlesByCat,
        empty: articlesByCat.length === 0,
        page_items: page_items,
        catId: catId,
        prevPage: prevPage,
        nextPage: nextPage,

    });
});

router.get('/search', async function (req, res) {

    const limit = 2;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;


    const keywords = req.query.keywords;
    const articlesList = await articleService.getArticlesByKeywords(keywords, limit, offset);

    const nPages = Math.ceil(articlesList.count / limit);
    const page_items = [];
    const prevPage = page === 1 ? page_items.length : page - 1;
    const nextPage = page === page_items.length ? 1 : page + 1;
    for (let i = 1; i <= nPages; i++) {
        page_items.push({
            value: i,
            active: i === +page,
        })
    }
    res.render('vwHome/articleListByKeywords', {
        layout: 'home',
        empty: articlesList.count === 0,
        page_items: page_items,
        prevPage: prevPage,
        nextPage: nextPage,
        keywords: keywords,
        articles: articlesList.content,

    })
});

router.get('/detailArticle', async function (req, res) {
    res.render('vwHome/detailArticle', {
        layout: 'home',
    })
});

export default router;