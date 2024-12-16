import express from 'express';
import articleService from '../services/articleService.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/writer/manage-articles');
});

router.get('/manage-articles', async function (req, res) {
    const writerId = 1;

    // Get list of articles of writer
    const listAvailableArticles = await articleService.getAvailableOfWriterByWriterId(writerId);
    const listDrafts = await articleService.getDraftOfWriterByWriterId(writerId);
    
    const isAvailableEmpty = listAvailableArticles.length === 0;
    const isDraftEmpty = listDrafts.length === 0;

    res.render('vwWriter/manage-articles', {
        layout: 'writer',
        title: 'Quản lí bài viết',
        isManage: true,
        availableArticles: listAvailableArticles,
        draftArticles: listDrafts,
        isAvailableEmpty: isAvailableEmpty,
        isDraftEmpty: isDraftEmpty,
    });
});

// ../writer/edit-article?id=
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