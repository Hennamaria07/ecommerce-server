import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
export const sendResetEmail = async ({ userEmail, subject, token, userId }) => {
  try {
    // Log the environment variables to ensure they are being read correctly
    console.log('MAILTRAPER_HOST:', process.env.MAILTRAPER_HOST);
    console.log('MAILTRAPER_USER:', process.env.MAILTRAPER_USER);
    console.log('MAILTRAPER_PASS:', process.env.MAILTRAPER_PASS);

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

    const mailOptions = {
      from: process.env.MAILTRAPER_USER, // sender address
      to: userEmail, // list of receivers
      subject: subject, // Subject line
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Forgot Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
    }

    .container {
      width: 90%;
      padding: 30px;
      border-radius: 5px;
    }

    h1 {
      text-align: center;
      margin-top: 0;
    }

    p {
      line-height: 1.5;
    }

    .button {
      display: block;
      background-color: #da4444;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      text-align: center;
      margin: 20px 0;
    }

    .button:hover {
      background-color: #da5555;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi there,</p>
    <p>We've received a request to reset your password for your account at our website.</p>
    <p>If you did not make this request, you can safely ignore this email.</p>
    <p>To reset your password, please click the link below:</p>
    <a href="${process.env.FRONTEND_HOST}/reset-password?user=${userId}&token=${token}" class="button">Reset Password</a>
    <p>This link will expire in 5 minutes.</p>
    <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
    <p>Best regards,<br>
    The Example Team</p>
  </div>
</body>
</html>`
    };

    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
