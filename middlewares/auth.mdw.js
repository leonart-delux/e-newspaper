import { extensions } from "sequelize/lib/utils/validator-extras";
import writerService from "../services/writerService.js";
import editorCategoriesService from "../services/editorCategoriesService.js";
import categoryService from "../services/categoryService.js";

export function isAuth(req, res, next) {
    if (!req.session.auth) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login-register');
    }
    next();
}

export function isWriter(req, res, next) {
    if (req.session.user.role !== 'writer') {
        const script = `
        <script>
            alert('Bạn không có quyền truy cập vào trang web này.');
            window.location.href = '/';
        </script>
        `;
        return res.status(403).send(script);
    }
    next();
}

export function isEditor(req, res, next) {
    if (req.session.user.role !== 'editor') {
        const script = `
        <script>
            alert('Bạn không có quyền truy cập vào trang web này.');
            window.location.href = '/';
        </script>
        `;
        return res.status(403).send(script);
    }

    req.session.editor = {};
    next();
}

// When writer do an action in writer route, check if this writer has auth to do that action
// It's like modifying another writer's article
export async function isValidWriter(req, res, next) {
    const article_id = +req.query.id || 0;
    if (article_id === 0) {
        return;
    }

    const articleOfWriter = await writerService.fetchArticleOfWriter(req.session.user.id, article_id);
    if (articleOfWriter.length === 0) {
        const script = `
        <script>
            alert('Bạn không có quyền truy cập vào trang web này.');
            window.location.href = '/';
        </script>
        `;
        return res.status(403).send(script);
    }

    next();
}

// Check if this editor has categories to work
export async function isEditorWorkAvailable(req, res, next) {
    const editorId = req.session.user.id;
    const categoryListOfEditor = await editorCategoriesService.getEditorCategories(editorId);
    if (categoryListOfEditor.length === 0) {
        const script = `
        <script>
            alert('Bạn chưa có chuyên mục nào để quản lý. Hãy quay lại sau!');
            window.location.href = '/';
        </script>
        `;
        return res.send(script);
    }

    req.session.editor.categories = categoryListOfEditor;
    req.session.editor.minCategory = categoryListOfEditor.reduce((min, item) => item.category_id < min.category_id ? item : min, categoryListOfEditor[0]);
    next();
}

export function isEditorHasPermissonOnCategory(req, res, next) {
    const inComingCatId = +req.query.catId || 0;
    const editorCategories = req.session.editor.categories;

    // Check if in coming category id is under editor business
    if (!editorCategories.some(cat => cat.category_id === inComingCatId)) {
        const script = `
        <script>
            alert('Bạn không có quyền truy cập vào phần quản lí danh mục này.');
            window.location.href = '/editor';
        </script>
        `;
        return res.send(script);
    }

    next();
}

export async function isEditorHasPermissionOnArticle(req, res, next) {
    const inComingArticleId = +req.query.id || 0;

    // Fetch article's categories and editor's categories
    const inComingArticleCategories = await categoryService.getCategoryListFromAnArticle(inComingArticleId);
    const editorCategories = req.session.editor.categories;

    // Check if any article category matches editor's categories
    const hasPermission = inComingArticleCategories.some(articleCat =>
        editorCategories.some(editorCat => editorCat.category_id === articleCat.category_id)
    );

    if (hasPermission) {
        return next();
    }

    // Deny access with an alert
    const script = `
        <script>
            alert('Bạn không có quyền phê duyệt bài viết này.');
            window.location.href = '/editor';
        </script>
    `;
    return res.send(script);
}
