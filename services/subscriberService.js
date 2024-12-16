import db from "../utils/db.js";
import accountService from "./accountService.js";

export default {
    async getVipStatus(userId) {
        const subscriber = await db('subscribers').where('user_id', userId).first();
        const user = await accountService.getUser(userId);

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
    addSubscriber(entity) {
        return db('subscribers').insert(entity);
    },


}