import db from "../utils/db.js";

export default {
    getEditorCategories(userId) {
        return db('editors_categories').where('editor_id', userId);
    },
    getEditorCategoryNames(userId) {
        return db('editors_categories')
            .join('categories', 'editors_categories.category_id', '=', 'categories.id')
            .where('editors_categories.editor_id', userId)
            .select('categories.name');
    },

};