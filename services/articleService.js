import db from "../utils/db.js";
import categoryService from "./categoryService.js";
import tagService from "./tagService.js";
import helper from "../utils/helper.js";

let now = new Date().toISOString();
export default {
    async getArticlesByCat(catId, limit, offset) {
        //Lấy tất cả các báo theo category ra
        let childCats = await categoryService.getChildCategories(catId);
        if (childCats.length !== 0) {
            childCats = childCats.map(cat => cat.id);
            childCats.push(catId);
        } else {
            childCats = Array.of(catId);
        }
        let articlesList = await db('articles')
            .where('articles.is_available', 1)
            .where('articles.publish_date', '<', now)
            .orderBy('is_premium', 'desc')
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .whereIn('articles_categories.category_id', childCats)
            .select('articles.id', 'articles.title', 'articles.abstract', 'articles.main_thumb', 'articles.id as article_id', 'articles.publish_date', 'is_premium')
            .limit(limit).offset(offset);
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
    async countByCatId(catId) {
        let childCats = await categoryService.getChildCategories(catId);
        if (childCats.length !== 0) {
            childCats = childCats.map(cat => cat.id);
            childCats.push(catId);
        } else {
            childCats = Array.of(catId);
        }
        return db('articles')
            .where('articles.is_available', 1)
            .where('articles.publish_date', '<', now)
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .whereIn('articles_categories.category_id', childCats)
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
            .orderBy('is_premium', 'desc')
            .whereRaw('MATCH(title,content,abstract) against (? in natural language mode)', [keywords])
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date','is_premium');
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
            .orderBy('is_premium', 'desc')
            .limit(limit)
            .offset(offset)
            .join('articles_tags', 'articles.id', 'articles_tags.article_id')
            .select('articles.id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date','is_premium');
        return this.getCatsAndTagsForAnArticle(articlesList);
    },

    async getNewestArticles(limit, offset) {
        //Lấy tất cả các báo theo category ra
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .orderBy('publish_date', 'desc')
            .orderBy('is_premium', 'desc')
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'articles.id as article_id', 'publish_date','is_premium');
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