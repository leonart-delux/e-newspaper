import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_MAILER, 
    host: process.env.MAIL_HOST, 
    port: process.env.MAIL_PORT, 
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD, 
    },
    tls: {
        rejectUnauthorized: false,  // Bỏ qua SSL validation
    }
});

const sendMail = async (to, subject, text, html) => {
    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, 
        to: to, 
        subject: subject, 
        text: text, 
        html: html, 
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công: ' + info.response);
        return info;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        throw error;
    }
};

export default sendMail;
