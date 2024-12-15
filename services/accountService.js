import db from "../utils/db.js";

export default {
    getVipUser(userId) {
        return db('users').where('user_id', userId)
            .join('subscribers', 'users.id', 'subscribers.user_id')
            .select('users.id', 'users.name', 'users.birth_date', 'users.email',
                'users.role', 'subscribers.outdate_time', 'subscribers.subscribe_time',).first();
    },
    getUser(userId) {
        return db('users').where('id', userId).first();
    },
    async getVipStatus(userId) {
        const subscriber = await db('subscribers').where('user_id', userId).first();
        const user = await this.getUser(userId);

        if (!subscriber) {
            user.vipStatus = 'notSubbed';
            return user;
        }

        if (subscriber.status === 'waiting') {
            user.vipStatus = 'waiting';
            return user;
        }
        user.vipStatus = 'active';
        return user;
    },

    async getWriterPseudonym(user) {
        const ret = await db('writers')
            .where('user_id', user.id).first();
        ret !== undefined ? user.pseudonym = ret.pseudonym : '';
        console.log(user);
        return user;
    },

    addSubscriber(entity) {
        return db('subscribers').insert(entity);
    },

    addSubscribeRequest(entity) {
        return db('subscribe_request').insert(entity);
    },

    updateUser(userId, entity) {
        return db('users').patch(userId, entity);
    },

}