import express from 'express';
import articleService from '../services/articleService.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/writer/manage-articles');
});

router.get('/manage-articles', async function (req, res) {
    // Get list of articles of writer
    const listAvailableArticles = await articleService.getAvailableOfWriterByWriterId(1);
    const listDrafts = await articleService.getDraftOfWriterByWriterId(1);

    res.render('vwWriter/manage-articles', {
        layout: 'writer',
        title: 'Quản lí bài viết',
        isManage: true,
        availableArticles: listAvailableArticles,
        draftArticles: listDrafts
    });
});

router.get('/edit-article', function (req, res) {
    res.render('vwWriter/edit-articles');
});

router.get('/draft-articles', function (req, res) {
    res.render('vwWriter/draft-articles', {
        layout: 'writer',
        title: 'Đăng tin mới',
        isCreate: true,
    });
});

router.get('/create-article', function (req, res) {
    res.render('vwWriter/create-articles');
});

export default router;