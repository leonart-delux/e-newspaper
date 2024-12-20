export function isAuth(req, res, next) {
    req.session.auth = true;
    if (!req.session.auth) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/account/login');
    }
    next();
}

export function isWriter(req, res, next) {
    // Chỉnh lại sau
    // if (req.session.user.role !== 'writer') {
    //     const script = `
    //     <script>
    //         alert('Bạn không có quyền truy cập vào trang web này.');
    //         window.location.href = '/';
    //     </script>
    //     `;
    //     return res.send(script);
    // }
    next();
}