import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { User } from "./types/user";

const JWT_SECRET = "secret_key";
const JWT_REFRESH_SECRET = "refresh_secret_key";

export const generateTokens = (user: User) => {
  const payload: User = {
    id: user.id,
    email: user.email,
  };

  // Access token (ważny 1 godzinę)
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // Refresh token (ważny np. 7 dni)
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ message: "User not authorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    const user: User = {
      id: decoded.id,
      email: decoded.email,
    };

    // Jeśli refresh token jest ważny, generujemy nowy access token
    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    res.json({ accessToken });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};
