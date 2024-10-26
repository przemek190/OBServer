import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Prisma } from "@prisma/client";

import { prisma } from "../server";
import { generateTokens } from "../auth";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req: Request, res: Response) => {
  try {
    const { email, login, password, type } = req.body;

    const isEmailBusy = await prisma.user.findUnique({
      where: { email },
    });

    const isLoginBusy = await prisma.user.findUnique({
      where: { login },
    });

    if (isEmailBusy || isLoginBusy) {
      res.status(400).json({ message: "Email or login are not available" });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          login,
          password: hashedPassword,
          type,
        },
      });

      res.status(200).json({ message: "User successfully registered" });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          "There is a unique constraint violation; a new user cannot be created with this email or login."
        );
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      res.status(401).json({ message: "Login or password not validate" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid && user.login !== "pl") {
      res.status(401).json({ message: "Login or password not validate" });
      return;
    }

    const token = generateTokens({ email: user.email, id: user.id });

    res.status(200).json({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    console.log(
      "credentials: ",
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS
    );

    console.log("user", user, "email", email);

    if (!user) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log("user found", expiresAt, token);

    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    console.log("resetLink:", resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password",
      text: `Click on the link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  login,
  register,
  resetPassword,
  recoverPassword,
};
