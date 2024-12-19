import fs from 'fs';
import fsExtra from 'fs-extra/esm';
import path from 'path';
import * as cheerio from 'cheerio';

export default {
    getSubscribeDate(outdatedDateTime) {
        // Chuyển đổi chuỗi thời gian thành đối tượng Date
        const outdate = new Date(outdatedDateTime); // Trừ đi 7 ngày
        const subscriptionDate = new Date(outdate);
        subscriptionDate.setDate(outdate.getDate() - 7);
        return subscriptionDate;
    },
    // Delete redundant images in article folder
    deleteUnrelatedImages(directory, imagesToKeep) {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Lỗi khi đọc thư mục:', err);
                return;
            }

            // Duyệt qua tất cả các tệp tin trong thư mục
            files.forEach(file => {
                // Nếu ảnh không có trong danh sách cần giữ lại, xóa ảnh
                if (!imagesToKeep.includes(file)) {
                    const filePath = path.join(directory, file);

                    // Kiểm tra xem file có phải là ảnh và xóa
                    fsExtra.remove(filePath, (err) => {
                        if (err) {
                            console.error('Lỗi khi xóa ảnh:', err);
                        } else {
                            console.log(`Đã xóa ảnh không liên quan: ${file}`);
                        }
                    });
                }
            });
        });
    },
    // Filter all image NAME in a HTML doc
    extractImageNames(content) {
        const $ = cheerio.load(content);
        const images = [];

        // Loop through all images
        $('img').each((i, img) => {
            const imgSrc = $(img).attr('src');
            const imgName = imgSrc.split('/').pop();  // Lấy tên ảnh từ src
            images.push(imgName);
        });

        return images;
    },
    // Delete article image folder
    deleteArticleImageFolder(directory) {
        fsExtra.remove(directory);
    },
    // Format date to hh/mm dd/mm/yyyy
    formatSimpleDatetime(datetime) {
        return datetime.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
}