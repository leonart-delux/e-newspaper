import accountService from "../services/accountService.js";
import moment from "moment";
import writerService from "../services/writerService.js";
import applyService from "../services/applyService.js";
import subscriberService from "../services/subscriberService.js";


export async function getVipUser(req, res, next) {

    //Lấy userid từ session rồi đè user mới lên vào session.user
    let user = await subscriberService.getVipStatus(req.session.user.id);
    user.birth_date = moment(user.birth_date).format("DD-MM-YYYY");
    user = await writerService.getWriterPseudonym(user);
    const userApply = await applyService.getPendingApplyUser(user.id);
    if (userApply) {
        user.roleStatus = 'pending';
    }
    req.session.user = user;
    next();
}