import express from "express";
import editorCategoriesService from "../services/editorCategoriesService.js";


const router = express.Router();

router.get('/', async function (req, res) {
    const editorId = 1;
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
    const editorId = 1;
    const activeCatId = +req.query.catId || 0;
    const categoryListOfEditor = await editorCategoriesService.getEditorCategoriesFullDetail(editorId);
    categoryListOfEditor.forEach(parentCat => {
        parentCat.children.forEach(cat => {
            if (activeCatId === cat.id) {
                cat.isActive = true;
            }
        });
    });

    res.render('vwEditor/drafts', {
        layout: 'editor',
        title: 'Danh sách bài viết cần phê duyệt',
        catList: categoryListOfEditor
    });
});

// ../editor/drafts/view?id=
router.get('/drafts/view', async function (req, res) {
    res.render('vwEditor/draft-view', {
        layout: 'editor',
        title: 'Tên bài viết'
    });
});

// ../editors/approve?id=
router.get('/approve', async function (req, res) {
    res.render('vwEditor/approve', {
        layout: 'editor',
        title: 'Duyệt bài viết'
    });
});

export default router;