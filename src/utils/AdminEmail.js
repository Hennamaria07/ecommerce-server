import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
export const sendAdminEmail = async ({ userEmail, subject, userName}) => {
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
        subject: "Welcome to Seller Dashboard", // Subject line
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }

    p {
      font-size: 16px;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      color: #fff;
      background-color: #da4444;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }

    .button:hover {
      background-color: #da5555;
    }
  </style>
</head>
<body>
  <p>Dear ${userName},</p>
  <p>Congratulations! You are now a seller on our platform. Welcome to the Seller Dashboard where you can manage your products and sales.</p>
  <p>To start, please login to your account using the button below:</p>
  <p><a href="${process.env.FRONTEND_HOST}/login" class="button">Login to Seller Dashboard</a></p>
  <p>If the button above doesn't work, please use the following link:</p>
  <p><a href="${process.env.FRONTEND_HOST}/login">${process.env.FRONTEND_HOST}/login</a></p>
  <p>We are excited to have you onboard and wish you success in your selling journey on our platform.</p>
  <p>Best regards,</p>
  <p>The UrbanNest Team</p>
</body>
</html>
`, // html body
    }
    const response = await transporter.sendMail(mailoptions);
    return response;
}