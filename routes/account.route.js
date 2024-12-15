import express from "express";
import accountService from "../services/accountService.js";
import helper from "../utils/helper.js";
import moment from "moment";

const userId = 4;

const router = express.Router();

router.get('/', async function (req, res) {
    const user = await accountService.getVipStatus(userId);
    req.session.user = accountService.getWriterPseudonym(user);
    res.redirect('account/information');
});

router.get('/information', async function (req, res) {
    //Đáng lẽ là lấy từ session nhưng tạm thời lấy từ db đã

    const user = req.session.user;

    res.render('vwAccount/information', {
        layout: 'account',
        information: true,
        user: user,
    });
});

router.get('/premium', function (req, res) {

    const user = req.session.user;

    const notSubbed = user.vipStatus === 'notSubbed';
    const waitingSubAccept = user.vipStatus === 'waiting';
    const activeSub = user.vipStatus === 'active';
    user.outdate_time = moment(user.outdate_time).format("DD-MM-YYYY, h:mm:ss a");
    user.subscribe_time = moment(user.subscribe_time).format("DD-MM-YYYY, h:mm:ss a");
    res.render('vwAccount/premium', {
        layout: 'account',
        premium: true,
        user: user,
        notSubbed: notSubbed,
        waitingSubAccept: waitingSubAccept,
        activeSub: activeSub,
    });
});

router.post('/premium', async function (req, res) {

    //Lấy user ra bằng session
    let user = req.session.user;

    const subscribers = {
        user_id: user.id,
        status: 'waiting',
    }

    let ret = await accountService.addSubscriber(subscribers);
    if (!ret) {
        return;
    }

    const subscribeRequest = {
        subscribe_id: ret.id,
    }

    ret = await accountService.addSubscribeRequest(subscribeRequest)

    req.session.user = await accountService.getVipStatus(userId);

    user = req.session.user;

    res.render('vwAccount/premium', {
        layout: 'account',
        premium: true,
        user: user,
    });
});
export default router;