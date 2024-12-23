import db from "../utils/db.js";
import accountService from "./accountService.js";

// let now = new Date().toISOString();
export default {
    async getVipStatus(userId) {
        let now = new Date();
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

        if (subscriber.outdate_time < now) {
            user.vipStatus = 'outdated';
            return user;
        }
        user.vipStatus = 'active';
        return user;
    },
    addSubscriber(entity) {
        return db('subscribers').insert(entity);
    },
    adminAddVip(userId) {
        let sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(now.getDate() + 7);
        let sevenDaysLaterISO = sevenDaysLater.toISOString();
        let nowISO = now.toISOString();
        const entity = {
            user_id: userId,
            status: 'active',
            subscribe_time: nowISO,
            outdate_time: sevenDaysLaterISO,

        }
        return db('subscribers').insert(entity);
    },
    acceptWaitingSubscribtion(subId) {
        let sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(now.getDate() + 7);
        let sevenDaysLaterISO = sevenDaysLater.toISOString();
        let nowISO = now.toISOString();

        return db('subscribers').where('id', subId).update(
            {
                status: 'active',
                subscribe_time: nowISO,
                outdate_time: sevenDaysLaterISO,
            })
    },
    deleteVipUsers(subId) {
        return db('subscribers').where('id', subId).delete();
    },

    renewVipUser(subId, entity) {
        return db('subscribers').where('id', subId).update(entity);
    },


}