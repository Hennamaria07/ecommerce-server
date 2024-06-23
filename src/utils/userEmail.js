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
        html: `<body>
<p>Dear Admin,</p>
<p>I am interested in becoming a seller on your platform. You can access my profile details are:</p>
<p>User Id:${userId}</p>
<p>User Registered Email:${userEmail}</p>
<p> OR click the link below </p>
 <p><a href="${process.env.FRONTEND_HOST}/admin/user/edit/${userId}">here</a>.</p> 
<p>Thank you.</p>
<p>Best regards,</p>
<p>[User's Name]</p>
</body>`, // html body
    };
    const response = await transporter.sendMail(mailoptions);
    return response;
}



