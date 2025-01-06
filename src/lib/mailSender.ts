import nodemailer from "nodemailer";
import { CustomError } from "./customErrors";
import { ENV } from "../configs/env";

const mailSender = async (email: string, title: string, body: string) => {
  try {
    // Create a Transporter to send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      from: "reddit-clone.anasp.me",
      port: 587,
      secure: false,
      auth: {
        user: ENV.MAIL.USER,
        pass: ENV.MAIL.PASS,
      },
    });

    // Send emails to users
    const info = await transporter.sendMail({
      from: "reddit-clone.anasp.me",
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
      <h2>Welcome to my Reddit clone!!</h2>
      <p>Please enter the following OTP to verify your email:</p>
      <h1 style="color: #FF4500;">${otp}</h1>
      <p>expires in 10 minutes</p>
    </div>
    `
  );
};

export const sendChangePasswordMail = async (email: string, otp: string) => {
  await mailSender(
    email,
    "Change Password",
    `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Reset your password</h2>
      <p>Please enter the following OTP to reset your password:</p>
      <h1 style="color: #FF4500;">${otp}</h1>
      <p>expires in 5 minutes</p>
    </div>
    `
  );
};

export const sendDeleteAccountMail = async (email: string) => {
  await mailSender(
    email,
    "Account Deleted",
    `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Your reddit-clone account has been deleted</h2>
      <p>Sorry to see you go. If you didn't request this, please contact us immediately.</p>
    </div>
    `
  );
};

export default mailSender;
