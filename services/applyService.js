import db from "../utils/db.js";

export default {
    addApplyRole(entity) {
        return db('apply').insert(entity);
    },

    getPendingApplyUser(userId) {
        return db('apply').where('user_id', userId).where('status', 'pending').first();
    },

    getApplicationById(id) { 
        // JOIN với bảng users để lấy thông tin name
        return db('apply')
            .join('users', 'apply.user_id', 'users.id')
            .select('apply.*', 'users.name as user_name')
            .where('apply.id', id)
            .first();
    },

    getApplicationsByRole(role) {
        // JOIN với bảng users để lấy thông tin name
        return db('apply')
            .join('users', 'apply.user_id', 'users.id')
            .select(
                'apply.id',
                'apply.user_id',
                'apply.self_access',
                'apply.status',
                'apply.role',
                'users.name as user_name' // Lấy cột name từ bảng users
            )
            .where('apply.role', role);
    },

    updateStatus(id, status) {
        return db('apply').where('id', id).update('status', status);
    },
}