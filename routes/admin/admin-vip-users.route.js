import express from "express";
import accountService from "../../services/accountService.js";
import subscriberService from "../../services/subscriberService.js";
import helper from "../../utils/helper.js";
import moment from "moment";

const router = express.Router();
router.get('/', async function (req, res) {
    const waitingVipUsers = await accountService.getAllStatusSubUser('waiting');
    let activeVipUsers = await accountService.getAllStatusSubUser('active');
    let outdatedVipUsers = await accountService.getOutdatedVipUser();
    outdatedVipUsers = outdatedVipUsers.map(vipUser => helper.splitDateAndTimeOutdatedTimeVipUsers(vipUser));
    activeVipUsers = activeVipUsers.map(vipUser => helper.splitDateAndTimeOutdatedTimeVipUsers(vipUser));
    res.render('vwAdmin/vip-users/vip-users-menu', {
        layout: 'admin',
        vipUsers: true,
        waitingVipUsers: waitingVipUsers,
        activeVipUsers: activeVipUsers,
        outdatedVipUsers: outdatedVipUsers,

    })
});

router.post('/add', async function (req, res) {
    const usersId = req.body.users;
    const ret = await subscriberService.adminAddVip(usersId);
    res.redirect('/admin/vip-users');
});

router.get('/accept', async function (req, res) {
    const subId = req.query.subId;
    const ret = await subscriberService.acceptWaitingSubscribtion(subId);
    res.redirect('/admin/vip-users');
});

router.get('/delete', async function (req, res) {
    const subId = req.query.subId;
    const ret = await subscriberService.deleteVipUsers(subId);
    res.redirect('/admin/vip-users');
});

router.post('/renewVip', async function (req, res) {
    const date = req.body.date;
    const time = req.body.time;
    const id = req.body.subId;
    let newOutdatedTime = new Date(`${date}T${time}`).toISOString();
    newOutdatedTime = moment(newOutdatedTime).format('YYYY-MM-DD HH:MM:SS');
    console.log(newOutdatedTime);
    const ret = await subscriberService.renewVipUser(id, {
        outdate_time: newOutdatedTime,
    })
    console.log(ret);
    res.redirect('/admin/vip-users');

});
export default router;