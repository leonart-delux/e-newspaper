import express from "express";
import editorCategoriesService from "../services/editorCategoriesService.js";
import articleService from "../services/articleService.js";
import categoryService from "../services/categoryService.js";
import tagService from "../services/tagService.js";

const router = express.Router();

router.get('/', async function (req, res) {
    const editorId = req.session.user.id;
    const categoryListOfEditor = await editorCategoriesService.getEditorCategories(editorId);
    if (categoryListOfEditor.length === 0) {
        const script = `
        <script>
            alert('Bạn chưa có chuyên mục nào để quản lý. Hãy quay lại sau!');
            window.location.href = '/';
        </script>
        `;
        res.send(script);
        return;
    }

    // Have some cat to work on
    const minCategory = categoryListOfEditor.reduce((min, item) => item.category_id < min.category_id ? item : min, categoryListOfEditor[0]);
    res.redirect(`/editor/drafts?catId=${minCategory.category_id}`);
});

// ../editor/drafts?catId=
router.get('/drafts', async function (req, res) {
    const editorId = req.session.user.id;
    const activeCatId = +req.query.catId || 0;
    const categoryListOfEditor = await editorCategoriesService.getEditorCategoriesFullDetail(editorId);
    let activeCatName = "";
    let activeParentName = "";
    categoryListOfEditor.forEach(parentCat => {
        parentCat.children.forEach(cat => {
            if (activeCatId === cat.id) {
                cat.isActive = true;
                activeCatName = cat.name;
                activeParentName = parentCat.name;
            }
        });
    });

    const drafts = await articleService.getPendingDraftsByCatId(activeCatId);
    const isEmpty = drafts.length === 0;

    res.render('vwEditor/drafts', {
        layout: 'editor',
        title: 'Danh sách bài viết cần phê duyệt',
        catList: categoryListOfEditor,
        activeCatName: activeCatName,
        activeParentName: activeParentName,
        drafts: drafts,
        isEmpty: isEmpty
    });
});

// ../editor/drafts/view?id=
router.get('/drafts/view', async function (req, res) {
    // Get draft
    const draftId = +req.query.id || 0;
    const draft = await articleService.getFullDraftInfoById(draftId);

    // Prepare data for categories and tags
    // For approve action
    const categoryTree = await categoryService.getCategoryTree();
    const tagList = await tagService.getAll();
    const articleCatList = draft.categories;
    const articleTagList = draft.tags;

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

    res.render('vwEditor/draft-view', {
        layout: 'main',
        title: draft.title,
        draft: draft,
        cData: categoryTree,
        tData: tagList,
    });
});

// ../editor/approve?id=
router.post('/approve', async function (req, res) {
    const article_id = +req.query.id || 0;
    const newCategories = req.body.newCategories;
    const newTags = req.body.newTags;
    const articleChanges = {
        is_available: 1,
        publish_date: req.body.publish_time,
        is_premium: req.body.isPremium === 'on' ? 1 : 0,
    };
    
    await articleService.patchArticle(article_id, articleChanges, newCategories, newTags);
    await articleService.delDraft(article_id);
    
    res.redirect('/editor');
});

// ../editor/reject?id=
router.post('/reject', async function (req, res) {
    const article_id = +req.query.id || 0;
    const draftChanges = {
        status: 'rejected',
        reject_reason: req.body.reject_reason,
    }
    await articleService.patchDraft(article_id, draftChanges);

    res.redirect('/editor');
});

export default router;