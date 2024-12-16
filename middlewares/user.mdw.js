import accountService from "../services/accountService.js";
import moment from "moment/moment.js";
import subscriberService from "../services/subscriberService.js";
import writerService from "../services/writerService.js";
import applyService from "../services/applyService.js";

const userId = 5;

export async function getVipUser(req, res, next) {
    //Tạm thời là lấy = userId sau này lấy bằng session
    let user = await subscriberService.getVipStatus(userId);
    user.birth_date = moment(user.birth_date).format("DD-MM-YYYY");
    user = await writerService.getWriterPseudonym(user);
    const userApply = await applyService.getPendingApplyUser(user.id);
    if (userApply) {
        user.roleStatus = 'pending';
    }
    req.session.user = user;

    next();
}