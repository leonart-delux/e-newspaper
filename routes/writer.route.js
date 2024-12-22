import express from 'express';
import multer from 'multer';
import helper from '../utils/helper.js';
import fsExtra from 'fs-extra';

import articleService from '../services/articleService.js';
import categoryService from '../services/categoryService.js';
import tagService from '../services/tagService.js';
import { isValidWriter} from '../middlewares/auth.mdw.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/writer/manage-articles');
});

router.get('/manage-articles', async function (req, res) {
    const writerId = req.session.user.id;

    // Get list of articles of writer
    const listAvailableArticles = await articleService.getAvailableOfWriterByWriterId(writerId);
    let listDrafts = await articleService.getDraftOfWriterByWriterId(writerId);
    const submittedDraftList = listDrafts.filter(element => !element.is_creating);

    const isAvailableEmpty = listAvailableArticles.length === 0;
    const isDraftEmpty = submittedDraftList.length === 0;

    res.render('vwWriter/manage-articles', {
        layout: 'writer',
        title: 'Quản lí bài viết',
        isManage: true,
        availableArticles: listAvailableArticles,
        draftArticles: submittedDraftList,
        isAvailableEmpty: isAvailableEmpty,
        isDraftEmpty: isDraftEmpty,
    });
});

// ../writer/edit-article?id=
router.get('/edit-article', isValidWriter, async function (req, res) {
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
    const categoryTree = await categoryService.getCategoryTree();
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
    const isPending = fullDraftInfo.status === 'pending';
    const isCreating = fullDraftInfo.status === 'creating';

    res.render('vwWriter/edit-articles', {
        layout: 'main',
        title: fullDraftInfo.title,
        draft: fullDraftInfo,
        cData: categoryTree,
        tData: tagList,
        isRejected: isRejected,
        isPending: isPending,
        isCreating: isCreating,
    });
});

// ../writer/save-draft?id=
router.post('/save-draft', isValidWriter, async function (req, res) {
    // Get draft id
    const draftId = +req.query.id || 0;
    if (draftId === 0) {
        return res.status(500).json({ error: 'Failed to save article' });
    }

    const directoryPath = `./static/images/articles/${draftId}`;

    // Ensure the directory exists (create it if it doesn't exist)
    try {
        await fsExtra.ensureDir(directoryPath);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create directory', details: err.message });
    }

    // Config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, directoryPath);
        },
        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        }
    });

    const upload = multer({ storage: storage });
    // Exec upload
    await upload.single('thumbnail')(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload file', details: err.message });
        }

        let thumbnailUrl = req.body.oldthumbnail;
        if (!req.file) {
            console.log('No file uploaded');
        }
        else {
            const newPath = `/static/images/articles/${draftId}/${req.file.filename}`;
            thumbnailUrl = newPath;
        }

        // Draft information
        let { title, abstract, categories, tags, content } = req.body;
        if (!categories) { categories = []; }
        if (!tags) { tags = []; }
        const draft = {
            id: draftId,
            title,
            abstract,
            main_thumb: thumbnailUrl,
            content,
        };

        // Delete old images
        const newImages = helper.extractImageNames(draft.content);
        const thumbName = thumbnailUrl.split('/').pop();
        newImages.push(thumbName);
        const directory = `static/images/articles/${draftId}`;
        helper.deleteUnrelatedImages(directory, newImages);

        // Patch data
        await articleService.patchArticle(draftId, draft, categories, tags);

        console.log(`Article #${draftId} saved:\n`, draft);
        res.redirect(`edit-article?id=${draftId}`);
    });
});

// ../writer/del-draft?id=
router.get('/del-draft', isValidWriter, async function (req, res) {
    const draftId = +req.query.id || 0;
    if (draftId === 0) {
        return res.status(500).json({ error: 'Failed to delete draft.' });
    }
    // Delete folder image
    const directory = `static/images/articles/${draftId}`;
    try {
        await helper.deleteArticleImageFolder(directory);
    } catch (err) {
        console.log(err);
    }
    // Delete in database
    await articleService.delArticle(draftId);
    res.redirect('manage-articles');
})

// ../writer/submit-draft?id=
router.get('/submit-draft', isValidWriter, async function (req, res) {
    const draftId = +req.query.id || 0;
    await articleService.submitDraft(draftId);
    res.redirect(`edit-article?id=${draftId}`)
})

// Upload image in article content
// ../upload-image?id = 
router.post('/upload-image', isValidWriter, async function (req, res) {
    const draftId = +req.query.id || 0;

    const directoryPath = `./static/images/articles/${draftId}`;

    // Ensure the directory exists (create it if it doesn't exist)
    try {
        await fsExtra.ensureDir(directoryPath);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create directory', details: err.message });
    }

    // Config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, directoryPath);
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

router.get('/create-articles', async function (req, res) {
    const writerId = req.session.user.id;

    // Get list of articles of writer
    let listDrafts = await articleService.getDraftOfWriterByWriterId(writerId);
    const creatingDraftList = listDrafts.filter(element => element.is_creating);

    const isDraftEmpty = creatingDraftList.length === 0;

    res.render('vwWriter/create-articles', {
        layout: 'writer',
        title: 'Tạo tin mới',
        isCreate: true,
        draftArticles: creatingDraftList,
        isDraftEmpty: isDraftEmpty,
    })
});

router.get('/create-new', async function (req, res) {
    const writer_id = req.session.user.id;
    const newDraftId = await articleService.createNewDraft(writer_id);
    res.redirect(`edit-article?id=${newDraftId}`);
})

export default router;