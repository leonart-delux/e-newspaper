import express, {json} from "express";
import accountService from "../services/accountService.js";
import helper from "../utils/helper.js";
import moment from "moment";
import bcrypt from 'bcryptjs'


const router = express.Router();

router.get('/', async function (req, res) {


    res.redirect('/account/information');
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

router.post('/information/update-pseudonym', async function (req, res) {
    const userId = req.session.user.id;
    const entity = {
        pseudonym: req.body.pseudonym,
    }
    const ret = await accountService.updatePseudonym(userId, entity);
    res.redirect('/account');
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

    req.session.user = await accountService.getVipStatus(userId);

    user = req.session.user;

    res.render('vwAccount/premium', {
        layout: 'account',
        premium: true,
        user: user,
    });
});

router.post('/information/update-name', async function (req, res) {
    const name = req.body.name;
    const user = req.session.user;
    const entity = {name: name}
    await accountService.updateUser(user.id, entity);
    res.redirect('/account');
});

router.post('/information/update-email', async function (req, res) {
    const email = req.body.email;
    const user = req.session.user;
    const entity = {email: email}
    await accountService.updateUser(user.id, entity);
    res.redirect('/account');
});

router.post('/information/update-birth-date', async function (req, res) {
    let dob = req.body.dob;
    console.log(dob);
    const user = req.session.user;
    dob = moment(dob, 'DD-MM-YYYY').format("YYYY-MM-DD");
    const entity = {birth_date: dob}
    await accountService.updateUser(user.id, entity);
    res.redirect('/account');
});

router.post('/information/update-password', async function (req, res) {
    const password = req.body.newPassword;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = req.session.user;
    const entity = {password: hashedPassword}
    console.log(entity);
    await accountService.updateUser(user.id, entity);
    res.redirect('/account');
});

router.post('/is-valid-password', function (req, res) {
    const password = req.body.password;
    const user = req.session.user;
    if (bcrypt.compareSync(password, user.password)) {
        return res.json(true);
    }
    return res.json(false);

});

router.get('/is-available-email', async function (req, res) {
    const email = req.query.email;
    const user = await accountService.isAvailableEmail(email);
    if (!user) {
        return res.json(true);
    }
    return res.json(false);
});

router.get('/saved-articles', function (req, res) {
    res.render('vwAccount/saved-articles', {
        layout: 'account',
        savedArticle: true,

    })
});

router.get('/role-register', function (req, res) {
    res.render('vwAccount/role-register', {
        layout: 'account',
        roleRegister: true,
        waiting: true,

    })
});

router.post('/role-register', async function (req, res) {

    const role = req.body.role;
    const user = req.session.user;

    if (role === 'writer') {
        const pseudonym = req.body.pseudonym;

        const entity = {
            pseudonym: pseudonym,
            user_id: user.id,
        }
        // const ret = await accountService.updateRoleToWriter(entity);
    }
});

export default router;