import db from "../utils/db.js";

export default {
    async getAvailableOfWriterByWriterId(id) {
        // Available list along with category list of each article (each article can have many categories)
        const articlesWithCategories = await db('articles')
            .where({ writer_id: id, is_available: 1 })
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .join('categories', 'articles_categories.category_id', 'categories.id')
            .join('articles_tags', 'articles.id', 'articles_tags.article_id')
            .join('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'articles.publish_date',
                'categories.id as category_id',
                'categories.name as category_name',
                'tags.id as tag_id',
                'tags.name as tag_name',
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
                    categories: [],
                    tags: [],
                };
            }

            if (row.category_id && row.category_name && 
                !articlesMap[row.id].categories.some(c => c.id === row.category_id)) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }

            if (row.tag_id && row.tag_name && 
                !articlesMap[row.id].tags.some(t => t.id === row.tag_id)) {
                articlesMap[row.id].tags.push({
                    id: row.tag_id,
                    name: row.tag_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
    async getDraftOfWriterByWriterId(id) {
        // Draft list along with category list of each article (each article can have many categories)
        const draftsWithCategories = await db('articles')
            .where({ writer_id: id, is_available: 0 })
            .join('drafts', 'articles.id', 'drafts.article_id')
            .whereIn('drafts.status', ['pending', 'rejected'])
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'drafts.status as status',
                'categories.id as category_id',
                'categories.name as category_name',
                'tags.id as tag_id',
                'tags.name as tag_name',
            );

        // Group categories by article
        const articlesMap = {};
        draftsWithCategories.forEach(row => {
            if (!articlesMap[row.id]) {
                articlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    is_rejected: row.status === 'rejected',
                    categories: [],
                    tags: [],
                };
            }

            if (row.category_id && row.category_name && 
                !articlesMap[row.id].categories.some(c => c.id === row.category_id)) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }

            if (row.tag_id && row.tag_name && 
                !articlesMap[row.id].tags.some(t => t.id === row.tag_id)) {
                articlesMap[row.id].tags.push({
                    id: row.tag_id,
                    name: row.tag_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
    async getFullDraftInfoById(id) {
        // Retrieve infor of draft from database
        const fullInfoDraft = await db('articles')
            .where('articles.id', id)
            .join('writers', 'articles.writer_id', 'writers.user_id')
            .leftJoin('drafts', 'articles.id', 'drafts.article_id')
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.*',
                'writers.pseudonym as writer_pseudonym',
                'drafts.status',
                'drafts.reject_reason',
                'drafts.date as last_modified',
                'categories.id as category_id',
                'tags.id as tag_id',
            );

        // Group categories and tags
        const draftMap = {};
        fullInfoDraft.forEach(row => {
            if (!draftMap[row.id]) {
                draftMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    content: row.content,
                    is_premium: row.is_premium,
                    is_available: row.is_available,
                    writer_id: row.writer_id,
                    writer_pseudonym: row.writer_pseudonym,
                    status: row.status,
                    reject_reason: row.reject_reason,
                    last_modified: row.last_modified,
                    categories: [],
                    tags: [],
                };
            }

            // Add category if it exists
            if (row.category_id && !draftMap[row.id].categories.includes(row.category_id)) {
                draftMap[row.id].categories.push(row.category_id);
            }

            // Add tag if it exists
            if (row.tag_id && !draftMap[row.id].tags.includes(row.tag_id)) {
                draftMap[row.id].tags.push(row.tag_id);
            }
        });

        // Dump to an object
        return (Object.values(draftMap))[0];
    },
};