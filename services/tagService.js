import db from "../utils/db.js";

export default {
    getTagListFromAnArticle(articleId) {
        //Only get tag_name
        return db('articles_tags').where('article_id', articleId)
            .join('tags', 'articles_tags.tag_id', 'tags.id')
            .select('name');

    },
};