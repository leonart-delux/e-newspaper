import moment from "moment";
import articleService from "../services/articleService.js";
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

    },

    //Đây là một call back function (hàm gọi hàm)
    // getArticles và count là 2 hàm được truyền vào
    // id là giá trị được sử dụng để tìm article (tag_id, keyword,cat_id)
    async paginationVars(id, limit, offset, page, getArticles, count, urlType) {
        const totalArticles = await count(id);
        let articles = null;
        if (urlType === 'newest') {
            articles = await getArticles.bind(articleService)(limit, offset);
        } else {
            articles = await getArticles.bind(articleService)(id, limit, offset);
        }
        const nPages = Math.ceil(totalArticles.quantity / limit);
        const page_items = [];
        for (let i = 1; i <= nPages; i++) {
            page_items.push({
                value: i,
                active: i === +page,
            })
        }
        const prevPage = page === 1 ? page_items.length : page - 1;
        const nextPage = page === page_items.length ? 1 : page + 1;
        return {
            page_items: page_items,
            prevPage: prevPage,
            nextPage: nextPage,
            articles: articles
        }
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