import fetch from "node-fetch";

async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    }
  );

  const data = await response.json();
  return data.success; // Trả về true nếu reCAPTCHA hợp lệ
}

export default verifyRecaptcha;
