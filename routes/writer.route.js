import express from 'express';
import multer from 'multer';
import helper from '../utils/helper.js';

import articleService from '../services/articleService.js';
import categoryService from '../services/categoryService.js';
import tagService from '../services/tagService.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/writer/manage-articles');
});

router.get('/manage-articles', async function (req, res) {
    // NHỚ ĐỔI LẤY WRITER ID TỪ SESSION
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
    const categoryTree = await categoryService.getAll();
    const tagList = await tagService.getAll();
    const articleCatList = fullDraftInfo.categories;
    const articleTagList = fullDraftInfo.tags;

    // Configure selected categories and tags
    categoryTree.forEach(parentCat => {
        parentCat.children.forEach(childCat => {
            if (articleCatList.includes(childCat.id)) {
                childCat.selected = true;
            }
        });
    });

    tagList.forEach(tag => {
        if (articleTagList.includes(tag.id)) {
            tag.selected = true;
        }
    });

    // Condition control
    const isRejected = fullDraftInfo.status === 'rejected';
    const isPending = fullDraftInfo.status === 'pending'

    res.render('vwWriter/edit-articles', {
        layout: 'main',
        title: fullDraftInfo.title,
        draft: fullDraftInfo,
        cData: categoryTree,
        tData: tagList,
        isRejected: isRejected,
        isPending: isPending,
    });
});

// ../writer/save-artcie?id=
router.post('/save-article', async function (req, res) {
    // Get draft id
    const draftId = +req.query.id || 0;
    if (draftId === 0) {
        return res.status(500).json({ error: 'Failed to save article' });
    }

    // Config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `./static/images/articles/${draftId}`;
            cb(null, path);
        },
        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        }
    });

    const upload = multer({ storage: storage });
    // Exec upload
    upload.single('thumbnail')(req, res, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload file', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Draft information
        const { title, abstract, categories, tags, content } = req.body;
        const draft = {
            id: draftId,
            title,
            abstract,
            main_thumbnail: `/static/images/article/${draftId}/${req.file.filename}`,
            categories,
            tags,
            content,
        };

        // Delete old images
        const newImages = helper.extractImageNames(draft.content);
        newImages.push(`${req.file.filename}`);
        const directory = `static/images/articles/${draftId}`;
        helper.deleteUnrelatedImages(directory, newImages);

        console.log(`Article #${draftId} saved:\n`, draft);
        res.redirect(`edit-article?id=${draftId}`);
    });
});

// Upload image in article content
// ../upload-image?id = 
router.post('/upload-image', function (req, res) {
    const draftId = +req.query.id || 0;

    // Config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `./static/images/articles/${draftId}`;
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
        const imageUrl = `/static/images/articles/${draftId}/${req.file.filename}`;
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