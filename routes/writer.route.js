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
router.get('/edit-article', async function (req, res) {
    // Get article info (draft)
    const articleId = +req.query.id || 0;
    const fullDraftInfo = await articleService.getFullDraftInfoById(articleId);

    // If published
    if (fullDraftInfo.is_available) {
        const script = `
        <script>
            alert('Bài viết đã được xuất bản!');
            window.location.href = '/writer/manage-articles';
        </script>
        `;
        res.send(script);
        return;
    }

    // Condition control
    const isRejected = fullDraftInfo.status === 'rejected';
    const isPending = fullDraftInfo.status === 'pending'

    res.render('vwWriter/edit-articles', {
        layout: 'main',
        title: fullDraftInfo.title,
        fullDraftInfo: fullDraftInfo,
        isRejected: isRejected,
        isPendingP: isPending,
    });
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