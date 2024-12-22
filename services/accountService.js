import { remove } from "fs-extra";
import db from "../utils/db.js";

export default {
    getUser(userId) {
        return db('users').where('id', userId).first();
    },

    updateUser(userId, entity) {
        return db('users').where('id', userId).update(entity);
    },

    addUser(entity) {
        return db('users').insert(entity);
    },

    removeUser(userId) {
        return db('users').where('id', userId).del();
    },

    isAvailableEmail(email) {
        return db('users').where('email', email).first();
    },

    // Hàm này trả về thông tin users lẫn pseudonym nếu có
    getAllUsers(limit = 10, offset = 0) {
        return db('users')
            .select('users.*', 'writers.pseudonym') 
            .leftJoin('writers', 'users.id', 'writers.user_id') 
            .orderBy('users.id', 'asc')
            .limit(limit)
            .offset(offset);
    },
    
    countUsers() {
        return db('users').count('id as count').first();
    },
}