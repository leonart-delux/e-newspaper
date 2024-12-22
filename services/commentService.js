import db from "../utils/db.js";
import helper from "../utils/helper.js";

export default {
    fetchCommentsOfArticleByArticleId(articleId) {
        return db('comments')
        .where('article_id', '=', articleId)
        .join('users', 'comments.user_id', '=', 'users.id')
        .select(
            'comments.*',
            'users.name as user'
        );
    },

    newComment(content, articleId, userId) {
        const newComment = {
            content,
            date: helper.formatFullDateTime(new Date()),
            article_id: articleId,
            user_id: userId,
        };
        return db('comments').insert(newComment);
    }
}