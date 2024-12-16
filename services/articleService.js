import db from "../utils/db.js";

export default {
    async getAvailableOfWriterByWriterId(id) {
        // Available list along with category list of each article (each article can have many categories)
        const articlesWithCategories = await db('articles')
            .where({ writer_id: id, is_available: 1 })
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'articles.publish_date',
                'categories.id as category_id',
                'categories.name as category_name'
            );

        // Group categories by article
        const articlesMap = {};
        articlesWithCategories.forEach(row => {
            if (!articlesMap[row.id]) {
                articlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    is_published: row.publish_date < Date.now(),
                    categories: []
                };
            }

            if (row.category_id && row.category_name) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
    async getDraftOfWriterByWriterId(id) {
        // Draft list along with category list of each article (each article can have many categories)
        const articlesWithCategories = await db('articles')
            .where({ writer_id: id, is_available: 0 })
            .join('drafts', 'articles.id', 'drafts.article_id')
            .whereIn('drafts.status', ['pending', 'rejected'])
            .orWhere('status', 'rejected')
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'drafts.status as status',
                'drafts.reject_reason as reject_reason',
                'categories.id as category_id',
                'categories.name as category_name'
            );

        // Group categories by article
        const articlesMap = {};
        articlesWithCategories.forEach(row => {
            if (!articlesMap[row.id]) {
                articlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    is_rejected: row.status === 'rejected',
                    reject_reason: row.reject_reason,
                    categories: []
                };
            }

            if (row.category_id && row.category_name) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
};