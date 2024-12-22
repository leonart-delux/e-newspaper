import db from "../utils/db.js";

export default {
    async getWriterPseudonym(user) {
        const ret = await db('writers')
            .where('user_id', user.id).first();
        ret !== undefined ? user.pseudonym = ret.pseudonym : '';
        return user;
    },
    updatePseudonym(userId, entity) {
        return db('writers').where('user_id', userId).update(entity);
    },

    updateRoleToWriter(entity) {
        return db('writers').insert(entity);
    },

    fetchArticleOfWriter(writer_id, article_id) {
        return db('articles')
            .where('id', article_id)
            .where('writer_id', writer_id);
    },

    async getWriterByUserId(userId) {
        // Lấy thông tin từ bảng `writers` dựa vào `user_id`
        return db('writers').where('user_id', userId).first();
    },

    async createOrUpdateWriter(userId, pseudonym) {
        const existingWriter = await db('writers').where('user_id', userId).first();
        if (existingWriter) {
            return db('writers').where('user_id', userId).update({ pseudonym });
        } else {
            return db('writers').insert({ user_id: userId, pseudonym });
        }
    }
}