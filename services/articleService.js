import db from "../utils/db.js";
import categoryService from "./categoryService.js";
import tagService from "./tagService.js";

export default {
    async getArticlesByCat(catId, limit, offset) {
        //Lấy tất cả các báo theo category ra
        let articlesList = await db('articles')
            .where('articles_categories.category_id', catId).limit(limit).offset(offset)
            .join('articles_categories', 'articles.id', '=', 'articles_categories.article_id')
            .select('id', 'title', 'abstract', 'main_thumb');

        // Với mỗi aricle thì thêm category names và tag names cho nó
        articlesList = await Promise.all(articlesList.map(async (article) => {
            article.categoryList = (await categoryService.getCategoryListFromAnArticle(article.id));
            article.tagList = (await tagService.getTagListFromAnArticle(article.id));
            return article;
        }))
        return articlesList;
    },
    countByCatId(catId) {
        return db('articles_categories')
            .where('articles_categories.category_id', catId)
            .count('* as quantity')
            .first();
    },

}