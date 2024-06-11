import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
export const sendResetEmail = async ({userEmail, subject, token, userId}) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAPER_HOST,
        port: 2525,
        auth: {
            user: process.env.MAILTRAPER_USER,
            pass: process.env.MAILTRAPER_PASS
        },
    });

    const mailoptions = {
        from: 'insuke@ai.com', // sender address
        to: userEmail, // list of receivers
        subject: subject, // Subject line
        html: `<body>
        <div class="container">
          <h1>Forgot Password</h1>
          <p>Hi there,</p>
          <p>We've received a request to reset your password for your account at our website.</p>
          <p>If you did not make this request, you can safely ignore this email.</p>
          <p>To reset your password, please click the link below:</p>
          <a href=${process.env.FRONTEND_HOST}/reset-password?user=${userId}&token=${token}" class="button">Reset Password</a>
          <p>This link will expire in 5 minutes.</p>
          <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
          <p>Best regards,<br>
          The Example Team</p>
        </div>
      </body>`, // html body
      }
      const response = await transporter.sendMail(mailoptions);
      return response;
}