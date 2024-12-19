import db from "../utils/db.js";
import categoryService from "./categoryService.js";
import tagService from "./tagService.js";
import helper from "../utils/helper.js";

let now = new Date().toISOString();
export default {
    async getArticlesByCat(catId, limit, offset) {
        //Lấy tất cả các báo theo category ra
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .where('articles_categories.category_id', catId).limit(limit).offset(offset)
            .join('articles_categories', 'articles.id', '=', 'articles_categories.article_id')
            .select('id', 'title', 'abstract', 'main_thumb', 'articles.id as article_id', 'publish_date');
        // Với mỗi aricle thì thêm category names và tag names cho nó
        return this.getCatsAndTagsForAnArticle(articlesList);
    },

    async getCatsAndTagsForAnArticle(articlesList) {
        articlesList = await Promise.all(articlesList.map(async (article) => {
            article.categoryList = (await categoryService.getCategoryListFromAnArticle(article.id));
            article.tagList = (await tagService.getTagListFromAnArticle(article.id));
            return article;
        }));

        //Lười quá nên đây để xử lý time lun

        articlesList = articlesList.map((article) => {
            article.publish_date = helper.formatDateTime(article.publish_date)
            return article;
        });

        return articlesList;
    },
    countByCatId(catId) {
        return db('articles_categories')
            .where('articles_categories.category_id', catId)
            .join('articles', 'articles_categories.article_id', 'articles.id')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .count('* as quantity')
            .first();
    },
    countByTagId(tagId) {
        return db('articles_tags')
            .where('articles_tags.tag_id', tagId)
            .join('articles', 'articles_tags.article_id', 'articles.id')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .count('* as quantity')
            .first();
    },
    async getArticlesByKeywords(keywords, limit, offset) {
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .whereRaw('MATCH(title,content,abstract) against (? in natural language mode)', [keywords])
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date');
        articlesList = await this.getCatsAndTagsForAnArticle(articlesList);


        return articlesList;
    },
    async countByKeywords(keywords) {
        return db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .whereRaw('MATCH(title,content,abstract) against (? in natural language mode)', [keywords])
            .count('* as quantity')
            .first();
    },

    async getArticlesByTags(tagId, limit, offset) {
        let articlesList = await db('articles')
            .where('articles_tags.tag_id', tagId)
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .limit(limit)
            .offset(offset)
            .join('articles_tags', 'articles.id', 'articles_tags.article_id')
            .select('articles.id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date');
        return this.getCatsAndTagsForAnArticle(articlesList);
    },

    async getNewestArticles(limit, offset) {
        //Lấy tất cả các báo theo category ra
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .orderBy('publish_date', 'desc')
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'articles.id as article_id', 'publish_date');
        // Với mỗi aricle thì thêm category names và tag names cho nó
        return this.getCatsAndTagsForAnArticle(articlesList);
    },
    count() {
        return db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .count('* as quantity')
            .first();
    },

}