import moment from "moment";

export default {
    getSubscribeDate(outdatedDateTime) {
// Chuyển đổi chuỗi thời gian thành đối tượng Date
        const outdate = new Date(outdatedDateTime); // Trừ đi 7 ngày
        const subscriptionDate = new Date(outdate);
        subscriptionDate.setDate(outdate.getDate() - 7);
        return subscriptionDate;
    },
    formatDateTime(dateStr) {
        moment.locale('vi');
        const dateTime = moment(dateStr).format('h:mm a,dddd,LL')

        const parts = dateTime.split(/,(.+)/);
        const timeParts = parts[0].split(' ');
        let dateParts = parts[1].split(',');
        if (timeParts[1] === 'sa') {
            timeParts[1] = 'Sáng';
        } else {
            timeParts[1] = 'Chiều';
        }
        let firstPart = dateParts[0].charAt(0).toUpperCase() + dateParts[0].slice(1);
        let secondPart = dateParts[1].replace(/(\d+)(\s+)/, '$1$2');
        console.log(secondPart);
        return `${timeParts[0]} ${timeParts[1]}, ${secondPart}`;

    }
}