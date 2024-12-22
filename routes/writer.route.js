import express from 'express';

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/writer/manage-articles');
});

router.get('/manage-articles', function (req, res) {
    res.render('vwWriter/manage-articles', {
        layout: 'writer',
        title: 'Quản lí bài viết',
        isManage: true,
    });
});

router.get('/edit-article', function (req, res) {
    res.render('vwWriter/edit-articles');
});

router.get('/draft-articles', function (req, res) {
    res.render('vwWriter/draft-articles', {
        layout: 'writer',
        title: 'Đămg tin mới',
        isCreate: true,
    });
});

router.get('/create-article', function (req, res) {
    res.render('vwWriter/create-articles');
});

export default router;