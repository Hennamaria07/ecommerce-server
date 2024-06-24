import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
export const verificationEmail = async ({ userEmail, subject, otp, userId }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAPER_HOST,
        port: 465,
        secure: 'SSL',
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.MAILTRAPER_USER,
            pass: process.env.MAILTRAPER_PASS
        },
        debug: true // Enable debug output
    });

    const mailoptions = {
        from: process.env.MAILTRAPER_USER, // sender address
        to: userEmail, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      width: 100vw;
      min-height: 100vh;
    }
    .container {
      margin: 0 auto;
      padding: 20px;
      border-radius: 5px;
    }
    .content {
      padding: 20px;
    }
    .otp {
      text-align: center;
      font-size: 30px;
      font-weight: bold;
      margin-top: 20px;
    }
    .validity {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    .button {
      display: block;
      background-color: #DA4444;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Thank you for signing up! Please use the following 4-digit code to verify your email address:</p>
      <div class="otp">${otp}</div>
      <div class="validity">This code is valid for 5 minutes.</div>
     <p> <a href="${process.env.FRONTEND_HOST}/${userId}/verify" class="button">Verify Email</a> </p>
  <p>If the button above doesn't work, please use the following link:</p>
  <p><a href="${process.env.FRONTEND_HOST}/${userId}/verify">${process.env.FRONTEND_HOST}/${userId}/verify</a></p>
    </div>
  </div>
</body>
</html>`, // html body
    }
    const response = await transporter.sendMail(mailoptions);
    return response;
}