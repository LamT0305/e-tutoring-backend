import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test the connection on service startup
try {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("Email credentials are missing in environment variables");
  } else {
    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP connection error:", error);
      } else {
        console.log("SMTP server is ready to send emails");
      }
    });
  }
} catch (error) {
  console.error("Email service initialization failed:", error);
}

export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials are not configured");
    }

    const mailOptions = {
      from: {
        name: "E-Tutoring System",
        address: process.env.EMAIL_USER,
      },
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
