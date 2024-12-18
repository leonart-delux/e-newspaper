import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment";
import passport from "passport";

import authService from "../services/auth.service.js";
import sendMail from "../utils/mailer.js";
import db from "../utils/db.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get("/login-register", (req, res) => {
  res.render("vwAccount/login-register", {
    title: "Login/Register",
    layout: "main",
  });
});

router.post("/login-register", async (req, res) => {
  const formType = req.body.formType;
  if (formType === "login") {
    const user = await authService.findByEmail(req.body.email);

    if (!user) {
      return res.render("vwAccount/login-register", {
        title: "Login/Register",
        layout: "main",
        has_errors: true,
        message: "Email không tồn tại.",
      });
    }

    if (!user.password) {
      return res.render("vwAccount/login-register", {
        title: "Login/Register",
        layout: "main",
        has_errors: true,
        message: "Có lỗi xảy ra trong việc xác thực mật khẩu.",
      });
    }

    const ret = bcrypt.compareSync(req.body.password, user.password);
    if (!ret) {
      return res.render("vwAccount/login-register", {
        title: "Login/Register",
        layout: "main",
        has_errors: true,
        message: "Mật khẩu không đúng.",
      });
    }

    res.redirect("/success-login");
  }
  if (formType === "register") {
    const { email, password } = req.body;

    const existingUser = await db("users").where({ email }).first();

    if (existingUser) {
      return res.render("vwAccount/login-register", {
        title: "Login/Register",
        layout: "main",
        has_errors: true,
        message: "Email đã được sử dụng.",
      });
    }

    const hash_password = bcrypt.hashSync(password, 8);

    const entity = {
      password: hash_password,
      email,
      role: "guest",
    };

    const ret = await authService.add(entity);

    res.redirect("/login-register");
  }
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/success");
  }
);

router.get("/forgot-password", (req, res) => {
  res.render("vwAccount/forgot-password", {
    title: "Forgot Password",
    layout: "main",
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Tạo OTP gồm 6 số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  req.session.otp = otp;
  req.session.otpExpires = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút
  req.session.email = email;

  const html = `
    <p>Xin chào,</p>
    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản email <strong>${email}</strong>.</p>
    <p>Vui lòng nhập mã xác thực sau đây trên trang xác minh để tiếp tục thực hiện đặt lại mật khẩu:</p>
    <h2 style="font-size: 32px; letter-spacing: 2px; color: #333; margin: 20px 0;">${otp}</h2>
    <p>Mã này sẽ hết hạn sau <strong>5 phút</strong> kể từ khi email này được gửi.</p>

    <h3 style="margin-top: 20px; color: #333;">Vì sao bạn nhận được email này?</h3>
    <p>Chúng tôi yêu cầu xác minh bất cứ khi nào tài khoản của bạn có yêu cầu thay đổi hoặc cập nhật thông tin để đảm bảo an toàn cho chính bạn.</p>

    <p>Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này và không cần thực hiện thêm hành động nào.</p>
    <br>
    <p>Trân trọng,<br>Đội ngũ báo Tuổi Già.</p>
`;

  await sendMail(email, "Mã xác thực OTP của bạn", "", html);

  console.log("OTP:", otp);
  res.json({ success: true, message: "OTP đã được gửi tới email của bạn." });
});

router.get("/forgot-password/otp-verify", (req, res) => {
  res.render("vwAccount/forgot-password-2", {
    title: "Forgot Password OTP Verify",
    layout: "main",
  });
});

router.post("/forgot-password/otp-verify", async (req, res) => {
  const { otp } = req.body;

  if (!req.session.otp || !req.session.otpExpires) {
    return res
      .status(400)
      .json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn." });
  }

  if (Date.now() > req.session.otpExpires) {
    return res.status(400).json({ success: false, message: "OTP đã hết hạn." });
  }

  if (otp !== req.session.otp) {
    return res.status(400).json({ success: false, message: "OTP không đúng." });
  }

  req.session.otp = null;
  req.session.otpExpires = null;

  res.json({
    success: true,
    redirectUrl: "/forgot-password/reset-password",
  });
});

router.get("/forgot-password/reset-password", (req, res) => {
  res.render("vwAccount/forgot-password-3", {
    title: "Reset Password",
    layout: "main",
  });
});

router.post("/forgot-password/reset-password", async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("Mật khẩu xác nhận không khớp.");
  }

  const email = req.session.email;

  if (!email) {
    return res.status(400).send("Email không hợp lệ.");
  }

  try {
    const result = await authService.updatePassword(email, newPassword);

    if (result) {
      res.redirect("/login-register");
    } else {
      res.status(500).send("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
    res.status(500).send("Có lỗi xảy ra. Vui lòng thử lại sau.");
  }
});

export default router;
