import express, {json} from "express";
import accountService from "../services/accountService.js";
import helper from "../utils/helper.js";
import moment from "moment";
import bcrypt from 'bcryptjs'
import applyService from "../services/applyService.js";
import subscriberService from "../services/subscriberService.js";
import writerService from "../services/writerService.js";
import editorCategoriesService from "../services/editorCategoriesService.js";
import {isAuth} from "../middlewares/auth.mdw.js";
import db from "../utils/db.js";

const router = express.Router();

router.get('/', async function (req, res) {
    res.redirect('/account/information');
});

router.get('/information', async function (req, res) {
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
    const ret = await writerService.updatePseudonym(userId, entity);
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
    let user = req.session.user;

    const subscribers = {
        user_id: user.id,
        vipStatus: 'waiting',
    }

    let ret = await subscriberService.addSubscriber(subscribers);
    if (!ret) {
        return;
    }

    req.session.user = await subscriberService.getVipStatus(user.id);

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

    // Cập nhật tên
    const entity = { name: name };
    await accountService.updateUser(user.id, entity);

    // Cập nhật hoặc tạo mới pseudonym
    await writerService.createOrUpdateWriter(user.id, name);

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

router.get('/role-register', async function (req, res) {
    const user = req.session.user;

    const waiting = user.roleStatus !== undefined;
    const userRole = user.role;

    // Kiểm tra thông tin người dùng từ database
    const dbUser = await db('users').where('id', user.id).first();
    const dbWriter = await db('writers').where('user_id', user.id).first();

    // Danh sách các thông tin còn thiếu
    const missingInfo = [];
    if (!dbUser.name) missingInfo.push('Họ và tên');
    if (!dbUser.birth_date) missingInfo.push('Ngày sinh');
    if (userRole === 'writer' && (!dbWriter || !dbWriter.pseudonym)) {
        missingInfo.push('Bút danh');
    }

    // Nếu thiếu thông tin, hiển thị thông báo
    if (missingInfo.length > 0) {
        return res.render('vwAccount/role-register', {
            layout: 'account',
            roleRegister: true,
            missingInfo: missingInfo.join(', '),
            updateLink: '/account/information', // Link đến trang cập nhật thông tin
        });
    }

    // Lấy danh sách các chuyên mục nếu là editor
    const categoryNames = await editorCategoriesService.getEditorCategoryNames(user.id);
    res.render('vwAccount/role-register', {
        layout: 'account',
        roleRegister: true,
        waiting: waiting,
        guest: userRole === 'guest' && waiting === false,
        editor: userRole === 'editor',
        writer: userRole === 'writer',
        categoryNames: categoryNames,
    })
});

router.post('/role-register', async function (req, res) {

    const role = req.body.role;
    const user = req.session.user;
    const apply = {
        self_access: req.body.selfAccess,
        status: 'pending',
        user_id: user.id,
        role: role,
    }

    const ret = await applyService.addApplyRole(apply);
    res.redirect('/account/role-register');
});

// router.post('/signOut', function (req, res) {
//     req.session.user = null;
//     res.redirect('/');
// });

router.post('/logout', isAuth, function (req, res) {
  req.session.auth = false;
  req.session.user = undefined;
  req.session.editor = undefined;
  req.session.writer = undefined;
  req.session.retUrl = null;
  res.redirect('/')
});

router.get('/unvip-users', async function (req, res) {
    const users = await accountService.getUnVipUsers();
    return res.json(users);

});

export default router;