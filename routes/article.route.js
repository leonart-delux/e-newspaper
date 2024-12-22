import express from "express";
import categoryService from "../services/categoryService.js";
import articleService from "../services/articleService.js";
import tagService from "../services/tagService.js";
import commentService from "../services/commentService.js";
import moment from "moment";
import helper from "../utils/helper.js";


const router = express.Router();

router.get('/', async function (req, res) {
    // Authorization
    const isAuth = req.session.user !== undefined;
    let isWriter, isEditor, isAdmin = false;
    if (isAuth) {
        isWriter = req.session.user.role === 'writer';
        isEditor = req.session.user.role === 'editor';
        isAdmin = req.session.user.role === 'admin';
    }

    // Date for homepage
    const categoryTree = await categoryService.getCategoryTree();
    const topViewArticles = await articleService.getTopViewArticlesWithCat(10);
    const newestArticles = await articleService.getNewestArticlesWithCat(10);
    const newestArticlesOfTopCat = await articleService.getNewestArticleOfTopCats(10);
    const topWeekArticles = await articleService.getTopWeekArticlesWithCat(4)


    res.render('vwHome/home', {
        layout: 'home',
        title: 'Tuổi Già Offline',
        isAuth: isAuth,
        isWriter: isWriter,
        isEditor: isEditor,
        isWriter: isWriter,
        isAdmin: isAdmin,
        categoryTree: categoryTree,
        topViewArticles: topViewArticles,
        newestArticles: newestArticles,
        newestArticlesOfTopCat: newestArticlesOfTopCat,
        topWeekArticles: topWeekArticles,
    });
});

// ../article?id=
router.get('/article', async function (req, res) {
    // Get article id
    const articleId = +req.query.id || 0;
    if (articleId === 0) {
        const script = `
        <script>
            alert('Vui lòng nhập ID bài viết khi truy cập bằng phương thức này.');
            window.location.href = '/';
        </script>
        `;
        return res.send(script);
    }

    // Get article information from database
    const fullInfoArticle = await articleService.getFullArticleInfoById(articleId);
    if (!fullInfoArticle) {
        const script = `
        <script>
            alert('Bài viết không tồn tại!');
            window.location.href = '/';
        </script>
        `;
        return res.send(script);
    }

    // Get comments of article
    const articleComments = await commentService.fetchCommentsOfArticleByArticleId(articleId);
    articleComments.forEach(comment => {
        if (!comment.user) {
            comment.user = 'Vô Danh';
        }
    });

    // Get relevants articles
    // Get category IDs of main article first
    const catIDsList = fullInfoArticle.categories.map(row => row.id)
    // Query to fetch data
    const relevantArticles = await articleService.getRandomSameCatArticles(articleId, catIDsList, 5);
    const noRelevantArticles = relevantArticles.length === 0;

    res.render('vwHome/article', {
        layout: 'home',
        article: fullInfoArticle,
        comments: articleComments,
        commentCount: articleComments.length,
        relevantArticles: relevantArticles,
        noRelevantArticles: noRelevantArticles,
    })
});

router.get('/cat', async function (req, res) {
    const catId = +req.query.catId || 6;
    const limit = 2;
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

    const limit = 2;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;
    const keywords = req.query.keywords;
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

router.get('/tag', async function (req, res) {
    const tagId = +req.query.tagId || 1;
    const limit = 2;
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
    const limit = 2;
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