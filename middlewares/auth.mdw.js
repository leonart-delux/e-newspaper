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
        return res.send(script);
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
        return res.send(script);
    }
    next();
}