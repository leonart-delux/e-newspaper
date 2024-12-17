import db from "../utils/db.js";

export default{
    getAllCategories() {
        return db('categories').select('*');
    },
    getChildCategories(catId) {
        return db('categories').where('parent_id', catId);
    },
    getCategory(catId) {
        return db('categories').where('id', catId).first();
    },
    getCategoryListFromAnArticle(articleId) {
        //Only get category_name
        return db('articles_categories').where('article_id', articleId)
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .select('name');
    },


}