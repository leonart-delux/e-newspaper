import db from "../utils/db.js";

export default {
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
            .select('name', 'articles_categories.category_id');
    },


    async getCategoryTree() {
        const categories = await db('categories');

        // Loop 2 times to create category hierachy
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        const tree = [];
        categories.forEach(cat => {
            if (cat.parent_id) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            } else {
                tree.push(categoryMap[cat.id]);
            }
        });

        return tree;
    },

    getTopViewCategories(amount) {
        return db('categories')
            .leftJoin('articles_categories', 'categories.id', 'articles_categories.category_id')
            .leftJoin('articles', 'articles.id', 'articles_categories.article_id')
            .select(
                'categories.id as category_id',
                'categories.name as category_name'
            )
            .sum('articles.view_count as total_views')
            .groupBy('categories.id', 'categories.name')
            .orderBy('total_views', 'desc')
            .limit(amount);
    }

};