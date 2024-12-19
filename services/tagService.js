import db from "../utils/db.js";

export default {
    getTagListFromAnArticle(articleId) {
        //Only get tag_name
        return db('articles_tags').where('article_id', articleId)
            .join('tags', 'articles_tags.tag_id', 'tags.id')
            .select('name', 'articles_tags.tag_id');
    },
    getTagNameById(tagId) {
        return db('tags').where('id', tagId).select('name as tagName').first();
    },

    getAll() {
        return db('tags');
    }
};