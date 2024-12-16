import db from "../utils/db.js";

export default {
    addApplyRole(entity) {
        return db('apply').insert(entity);
    },
    getPendingApplyUser(userId) {
        return db('apply').where('user_id', userId).where('status', 'pending').first();
    },
}