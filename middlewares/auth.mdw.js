import { extensions } from "sequelize/lib/utils/validator-extras";
import writerService from "../services/writerService.js";
import editorCategoriesService from "../services/editorCategoriesService.js";

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

// When editor do an action in editor route, check if category (of article) is under his/her permission
export async function isValidEditor(req, res, next) {

    next();
}