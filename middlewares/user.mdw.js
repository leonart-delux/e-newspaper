import accountService from "../services/accountService.js";
import moment from "moment/moment.js";

const userId = 5;

export async function getVipUser(req, res, next) {
    //Tạm thời là lấy = userId sau này lấy bằng session
    const user = await accountService.getVipStatus(userId);
    user.birth_date = moment(user.birth_date).format("DD-MM-YYYY");
    req.session.user = await accountService.getWriterPseudonym(user);
    next();
}