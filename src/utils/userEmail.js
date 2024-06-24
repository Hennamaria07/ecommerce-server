import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
export const sendUserEmail = async ({ userEmail, subject, userId }) => {
    // console.log('email', userEmail)
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
        from: userEmail, // sender address
        to: process.env.MAILTRAPER_USER, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 0px 20px;
    }

    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 10px;
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
    .button a {
    text-decoration: none;
    color: #fff;
    }
    .button:hover {
      background-color: #005bb5;
    }

    .footer {
      margin-top: 20px;
      font-style: italic;
      color: #666;
    }
  </style>
</head>
<body>
  <p>Dear Admin,</p>
  <p>I am interested in becoming a seller on your platform. Below are my profile details:</p>
  <p>User ID: ${userId}</p>
  <p>User Registered Email: ${userEmail}</p>
  <p>Alternatively, you can access my profile <p class="button"><a href='${process.env.FRONTEND_HOST}/admin/user/edit/${userId}'>here</p>.</a></p> 
  <p>Thank you.</p>
  <p>Best regards,</p>
  <p>UrbanNest Team</p>

  <div class="footer">
    <p>Please do not reply to this email.</p>
    <p>UrbanNest Platform</p>
  </div>
</body>
</html>
`, // html body
    };
    const response = await transporter.sendMail(mailoptions);
    return response;
}



