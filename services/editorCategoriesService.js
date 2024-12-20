import db from "../utils/db.js";

export default {
    getEditorCategories(userId) {
        return db('editors_categories').where('editor_id', userId);
    },
    getEditorCategoryNames(userId) {
        return db('editors_categories')
            .where('editor_id', userId)
            .join('categories', 'editors_categories.category_id', '=', 'categories.id')
            .select('categories.name');
    },
    async getEditorCategoriesFullDetail(userId) {
        const rawEditorCatList = await db('editors_categories')
            .where('editor_id', userId)
            .join('categories', 'editors_categories.category_id', '=', 'categories.id')
            .leftJoin('categories as parents', 'categories.parent_id', '=', 'parents.id')
            .select(
                'categories.id as id',
                'categories.name as name',
                'categories.parent_id as parent_id',
                'parents.name as parent_name'
            );
    
        const tree = {};
    
        rawEditorCatList.forEach(cat => {
            // Nếu là danh mục cha hoặc cha chưa tồn tại trong tree
            if (!tree[cat.parent_id]) {
                tree[cat.parent_id] = {
                    id: cat.parent_id,
                    name: cat.parent_name || 'Lỗi danh mục',
                    children: [],
                };
            }
    
            // Thêm danh mục con vào cha
            tree[cat.parent_id].children.push({
                id: cat.id,
                name: cat.name,
                parent_id: cat.parent_id,
            });
        });
    
        return Object.values(tree);
    }
};