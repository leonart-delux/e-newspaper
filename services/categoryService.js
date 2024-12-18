import db from '../utils/db.js';

export default {
    async getAll() {
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
    }
};