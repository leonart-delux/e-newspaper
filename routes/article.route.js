import express from "express";
import categoryService from "../services/categoryService.js";
import articleService from "../services/articleService.js";
import tagService from "../services/tagService.js";
import moment from "moment";
import helper from "../utils/helper.js";


const router = express.Router();
const limit = 10;
router.get('', function (req, res) {
    res.render('vwHome/home', {
        layout: 'home',
    });
});
router.get('/cat', async function (req, res) {
    const catId = +req.query.catId || 1;

    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const childCats = await categoryService.getChildCategories(catId);

    const category = await categoryService.getCategory(catId);

    const paginationVars =
        await helper.paginationVars(catId, limit, offset, page, articleService.getArticlesByCat, articleService.countByCatId);

    res.render('vwHome/articleListByCat', {
        layout: 'home',
        mainCat: category,
        childCats: childCats,
        articles: paginationVars.articles,
        empty: paginationVars.articles.length === 0,
        page_items: paginationVars.page_items,
        catId: catId,
        prevPage: paginationVars.prevPage,
        nextPage: paginationVars.nextPage,

    });
});

router.get('/search', async function (req, res) {
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;
    const keywords = req.query.keywords.trimEnd();
    const paginationVars =
        await helper.paginationVars(keywords, limit, offset, page, articleService.getArticlesByKeywords, articleService.countByKeywords);
    res.render('vwHome/articleListByKeywords', {
        layout: 'home',
        empty: paginationVars.articles.length === 0,
        page_items: paginationVars.page_items,
        prevPage: paginationVars.prevPage,
        nextPage: paginationVars.nextPage,
        keywords: keywords,
        articles: paginationVars.articles,
    })
});

router.get('/detailArticle', async function (req, res) {
    res.render('vwHome/detailArticle', {
        layout: 'home',
    })
});


router.get('/tag', async function (req, res) {
    const tagId = +req.query.tagId || 1;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;
    const tag = await tagService.getTagNameById(tagId);
    const paginationVars =
        await helper.paginationVars(tagId, limit, offset, page, articleService.getArticlesByTags, articleService.countByTagId);
    res.render('vwHome/articleListByTag', {
        layout: 'home',
        tagName: tag.tagName,
        articles: paginationVars.articles,
        empty: paginationVars.articles.length === 0,
        page_items: paginationVars.page_items,
        tagId: tagId,
        prevPage: paginationVars.prevPage,
        nextPage: paginationVars.nextPage,
    });
});

router.get('/newest', async function (req, res) {
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const paginationVars =
        await helper.paginationVars(null, limit, offset, page, articleService.getNewestArticles, articleService.count, 'newest');
    res.render('vwHome/articleNewest', {
        layout: 'home',
        articles: paginationVars.articles,
        empty: paginationVars.articles.length === 0,
        page_items: paginationVars.page_items,
        prevPage: paginationVars.prevPage,
        nextPage: paginationVars.nextPage,

    });
});


export default router;