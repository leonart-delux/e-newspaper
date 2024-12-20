import writerService from "../services/writerService.js";

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

// When writer do an action, check if this writer has auth to do that action
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