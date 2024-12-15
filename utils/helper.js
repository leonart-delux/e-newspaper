export default {
    getSubscribeDate(outdatedDateTime) {
// Chuyển đổi chuỗi thời gian thành đối tượng Date
        const outdate = new Date(outdatedDateTime); // Trừ đi 7 ngày
        const subscriptionDate = new Date(outdate);
        subscriptionDate.setDate(outdate.getDate() - 7);
        return subscriptionDate;
    },
}