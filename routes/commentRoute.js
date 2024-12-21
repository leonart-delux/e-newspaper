import express from 'express';
import commentService from '../services/commentService.js';
import { isAuth } from '../middlewares/auth.mdw.js';

const router = express.Router();

// user comment
// ../newComment?articleId=
router.post('/newComment', isAuth, async function (req, res) {
    const articleId = +req.query.articleId || 0;
    if (articleId === 0) {
        res.redirect('/');
    }
    
    const commentContent = req.body.comment;
    await commentService.newComment(commentContent, articleId, req.session.user.id);

    res.redirect(`/article?id=${articleId}`);
})

export default router;