import db from "../utils/db.js";

export default{
    getAllCategories() {
        return db('categories').select('*');
    },
}