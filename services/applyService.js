import db from "../utils/db.js";

export default {
    addApplyRole(entity) {
        return db('apply').insert(entity);
    },

    getPendingApplyUser(userId) {
        return db('apply').where('user_id', userId).where('status', 'pending').first();
    },

    getApplicationById(id) { 
        return db('apply').where('id', id).first();
    },

    getApplicationsByRole(role) {
        return db('apply')
            .select('id', 'user_id', 'self_access', 'status', 'role')
            .where('role', role);
    },

    updateStatus(id, status) {
        return db('apply').where('id', id).update('status', status);
    },  
}