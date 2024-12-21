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

    isAvailableEmail(email) {
        return db('users').where('email', email).first();
    },
}