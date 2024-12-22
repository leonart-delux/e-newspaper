import express from "express";
import userService from '../../services/accountService.js';
import writerService from '../../services/writerService.js'; 
import bcrypt from 'bcryptjs';  

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; 
        const offset = (page - 1) * limit; 

        const [users, total] = await Promise.all([
            userService.getAllUsers(limit, offset), 
            userService.countUsers(), 
        ]);

        const totalPages = Math.ceil(total.count / limit); 

        res.render("vwAdmin/users/users-menu", {
            layout: "admin",
            users,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Có lỗi xảy ra khi lấy danh sách người dùng.");
    }
});

router.get('/edit', async (req, res) => {
    try {
        const userId = req.query.id; 
        const user = await userService.getUser(userId);

        // Render giao diện edit và truyền dữ liệu người dùng
        res.render('vwAdmin/users/users-edit', {
            layout: 'admin',
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Đã xảy ra lỗi.');
    }
});

router.post('/edit', async (req, res) => {
    try {
        const { id, name, role, pseudonym, email } = req.body;

        // Lọc các giá trị null hoặc undefined để cập nhật vào `users`
        const userData = { name, role, email };
        const sanitizedUserData = Object.keys(userData).reduce((acc, key) => {
            if (userData[key] !== null && userData[key] !== undefined) {
                acc[key] = userData[key];
            }
            return acc;
        }, {});

        // Kiểm tra xem người dùng có tồn tại trong writer không
        const writerExist = await writerService.getWriterByUserId(id);

        // Cập nhật thông tin trong bảng `users`
        if (Object.keys(sanitizedUserData).length > 0) {
            if (role !== 'writer' && writerExist) {
                await writerService.removeWriter(id);
            }
            await userService.updateUser(id, sanitizedUserData);
        }

        if (pseudonym && role === 'writer') {
            if (writerExist) {
                await writerService.updatePseudonym(id, { pseudonym });
            } else {
                await writerService.addWriter(id, { pseudonym });
            }
        }

        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Đã xảy ra lỗi khi cập nhật.');
    }
});

router.get('/delete', async (req, res) => {
    try {
        const userId = req.query.id; 
        console.log(userId);

        res.render('vwAdmin/users/users-delete', {  
            layout: 'admin',
            userId,
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Đã xảy ra lỗi khi hiển thị trang xác nhận.');
    }
});

router.post('/delete', async (req, res) => {
    try {
        const userId = req.body.id;

        if (user.role === 'writer') {
            const writerExist = await writerService.getWriterByUserId();
            if (writerExist) {
                await writerService.removeWriter();
            }
        }

        await userService.removeUser();

        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Đã xảy ra lỗi khi xóa người dùng.');
    }
});

router.get('/add', async (req, res) => {
    res.render('vwAdmin/users/users-add', {
        layout: 'admin',
    });
});

router.post('/add', async (req, res) => {
    try {
        const { name, birth_date, email, password, role  } = req.body;

        const hashedPassword = bcrypt.hashSync(password, 8);

        const user = {
            name,
            birth_date,
            email,
            password: hashedPassword,
            role,
        }

        const userEntiry = await userService.addUser(user);
        console.log("ID: ", userEntiry[0]);
        console.log("Name: ", userEntiry[1]);

        if (role === 'writer') {
            const userId = userEntiry[0];
            const pseudonym = userEntiry[1];
            await writerService.addWriter(userId, { pseudonym });
        }

        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).send('Đã xảy ra lỗi khi thêm người dùng.');
    }
});

export default router;