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
}