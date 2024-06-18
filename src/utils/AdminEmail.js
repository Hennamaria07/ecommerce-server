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
        html: `<body>
<p>Dear ${userName},</p>
<p>Congratulations! You are now a seller on our platform. Welcome to the Seller Dashboard where you can manage your products and sales.</p>
<p>To start, please login to your account using the link below:</p>
<p><a href="${process.env.FRONTEND_HOST}/login">Login to Seller Dashboard</a></p>
<p>We are excited to have you onboard and wish you success in your selling journey on our platform.</p>
<p>Best regards,</p>
<p>The Platform Team</p>
</body>`, // html body
    }
    const response = await transporter.sendMail(mailoptions);
    return response;
}