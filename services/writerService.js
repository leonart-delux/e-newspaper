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

}