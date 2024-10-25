import express, { type Request, type Response, type Express } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bcrypt from "bcryptjs";
import { generateTokens, verifyToken } from "./auth";

const prisma = new PrismaClient();
const app: Express = express();

app.use(cors());
app.use(express.json());

// Companies

app.get("/companies", verifyToken, async (req: Request, res: Response) => {
  const companies = await prisma.company.findMany();
  res.json(companies);
});

app.post("/companies", verifyToken, async (req: Request, res: Response) => {
  const { name, address, phone } = req.body;

  try {
    const company = await prisma.company.create({
      data: {
        name,
        address,
        phone,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

app.post("/companies", verifyToken, async (req: Request, res: Response) => {
  const { name, address, phone } = req.body;

  try {
    const company = await prisma.company.create({
      data: {
        name,
        address,
        phone,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

app.get("/companies/:id/appointments", verifyToken, async (req, res) => {
  const { id } = req.params;
  const appointments = await prisma.appointment.findMany({
    where: { company_id: Number(id), is_booked: false },
  });
  res.json(appointments);
});

// Users

app.post("/register", async (req: Request, res: Response) => {
  const { email, login, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        login,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "Register successful" });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { login, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      res.status(401).json({ message: "Nieprawidłowy login lub hasło" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Nieprawidłowy login lub hasło" });
    }

    const token = generateTokens({ email: user.email, id: user.id });

    res.json({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login unsuccessful" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
