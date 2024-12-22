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

    //Chỉ lấy những thằng không vip, không bao gồm vip active, vip pending,vip outdated, nói chung là không có trong
    //bảng subscribers.
    getUnVipUsers() {
        return db('users')
            .leftJoin('subscribers', 'users.id', 'subscribers.user_id')
            .whereNull('subscribers.user_id')
            .select('users.*');
    },
    getAllStatusSubUser(status) {
        return db('users')
            .join('subscribers', 'users.id', 'subscribers.user_id')
            .where('status', status)
            .select('users.id as user_id', 'users.email', 'subscribers.outdate_time', 'subscribers.subscribe_time', 'subscribers.id as id');
    },
    getOutdatedVipUser() {
        return db('users')
            .join('subscribers', 'users.id', 'subscribers.user_id')
            .where('subscribers.outdate_time', '<', new Date())
            .select('users.id as user_id', 'users.email', 'subscribers.outdate_time', 'subscribers.subscribe_time', 'subscribers.id as id');
    },

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