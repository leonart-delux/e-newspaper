import express from 'express';
import multer from 'multer';
import articleService from '../services/articleService.js';
import categoryService from '../services/categoryService.js';
import tagService from '../services/tagService.js';

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

    // Get category & tag list
    const categoryList = await categoryService.getAll();
    const tagList = await tagService.getAll();
    const articleCatList = fullDraftInfo.categories;
    const articleTagList = fullDraftInfo.tags;

    // Configure
    const cData = categoryList.map(element => {
        return {
            id: element.id,
            text: element.name,
            selected: articleCatList.includes(element.id)
        };
    });

    const tData = tagList.map(element => {
        return {
            id: element.id,
            text: element.name,
            selected: articleTagList.includes(element.id)
        };
    });

    // Condition control
    const isRejected = fullDraftInfo.status === 'rejected';
    const isPending = fullDraftInfo.status === 'pending'

    res.render('vwWriter/edit-articles', {
        layout: 'main',
        title: fullDraftInfo.title,
        draft: fullDraftInfo,
        cData: cData,
        tData: tData,
        isRejected: isRejected,
        isPending: isPending,
    });
});

router.post('/edit-article', async function (req, res) {
   console.log(req.body);
   res.redirect('manage-articles');
});

// Upload image in article
// ../upload-image?id = 
router.post('/upload-image', function (req, res) {
    const article_id = +req.query.id || 0;

    // Config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `./static/images/articles/${article_id}`;
            cb(null, path);
        },
        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        }
    });

    const upload = multer({ storage: storage });
    // Exec upload
    upload.single('file')(req, res, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload file', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return path URL
        const imageUrl = `/static/images/articles/${article_id}/${req.file.filename}`;
        res.json({ location: imageUrl });
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