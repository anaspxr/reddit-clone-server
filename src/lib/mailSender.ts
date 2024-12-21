import nodemailer from "nodemailer";
import { CustomError } from "./customErrors";
import { ENV } from "../configs/env";

const mailSender = async (email: string, title: string, body: string) => {
  try {
    // Create a Transporter to send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: ENV.MAIL.USER,
        pass: ENV.MAIL.PASS,
      },
    });

    // Send emails to users
    const info = await transporter.sendMail({
      from: "noreply@reddit.clone",
      to: email,
      subject: title,
      html: body,
    });
    return info;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }
    throw new CustomError("Error when sending Email", 500);
  }
};

export const sendRegisterOtpMail = async (email: string, otp: string) => {
  await mailSender(
    email,
    "Verify your email",
    `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Verify your email</h2>
      <p>Please enter the following OTP to verify your email:</p>
      <h1 style="color: #FF4500;">${otp}</h1>
      <p>expires in 10 minutes</p>
	  
      <p>Welcome to Reddit!!!</p>
    </div>
    `
  );
};

export default mailSender;
