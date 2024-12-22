import express from 'express';
import articleService from '../../services/articleService.js';
import categoryService from '../../services/categoryService.js';
import tagService from '../../services/tagService.js';

const router = express.Router();

router.get('/', async function (req, res) {
    res.render('vwAdmin/articles/articles-menu', {
        layout: 'admin',
        articles: true,
    });
});

router.get('/add', async function (req, res) {
    try {
        // Lấy danh sách tags và categories từ database
        const tags = await tagService.getAllTags(); // Sử dụng service để lấy tags
        const categories = await categoryService.getAllCategories(); // Sử dụng service để lấy categories

        // Render giao diện thêm bài viết
        res.render('vwAdmin/articles/articles-add', {
            layout: 'admin',
            tags: tags,
            categories: categories,
        });
    } catch (error) {
        console.error('Error fetching tags/categories:', error);
        res.render('vwAdmin/articles/articles-add', {
            layout: 'admin',
            error: 'Không thể tải dữ liệu tags và categories.',
        });
    }
});

// Route POST: Xử lý thêm bài viết
router.post('/add', async function (req, res) {
    try {
        // Lấy dữ liệu từ form
        const { title, content, tags, categories, publish_date } = req.body;
        const thumbnail = req.file ? req.file.filename : '/default_thumbnail.jpg'; // Gán giá trị mặc định nếu không có file

        // Tạo bài viết mới
        const newArticle = {
            title: title.trim(),
            abstract: content.substring(0, 200), // Tóm tắt tự động từ nội dung
            content,
            main_thumb: thumbnail,
            publish_date,
            is_available: 0, // Mặc định chưa công khai
        };

        // Thêm bài viết vào cơ sở dữ liệu
        const articleId = await articleService.createNewDraft(req.user.id); // Tạo draft mới
        await articleService.patchArticle(articleId, newArticle, categories, tags); // Cập nhật draft với dữ liệu từ form

        res.redirect('/admin/articles'); // Chuyển hướng về trang danh sách bài viết
    } catch (error) {
        console.error('Error adding article:', error);
        const tags = await tagService.getAllTags();
        const categories = await categoryService.getAllCategories();
        res.render('vwAdmin/articles/articles-add', {
            layout: 'admin',
            error: 'Có lỗi xảy ra khi thêm bài viết. Vui lòng thử lại.',
            tags: tags,
            categories: categories,
        });
    }
});

export default router;