// password-toggle.js
document.addEventListener('DOMContentLoaded', function () {
    // Tính năng ẩn/hiện mật khẩu cho đăng nhập
    document.getElementById('toggleLoginPassword').addEventListener('click', function () {
        const passwordField = document.getElementById('loginPassword');
        const eyeIcon = document.getElementById('eyeIcon');
  
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});
  
// Tính năng ẩn/hiện mật khẩu cho đăng ký
document.getElementById('toggleRegisterPassword').addEventListener('click', function () {
    const passwordField = document.getElementById('registerPassword');
    const eyeIcon = document.getElementById('eyeIcon');
  
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
    });
});
  