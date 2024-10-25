import express, { type Request, type Response, type Express } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { verifyToken } from "./auth";
import UserRouter from "./routes/user.router";

export const prisma = new PrismaClient();
export const app: Express = express();

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

app.get("/companies/:id/appointments", verifyToken, async (req, res) => {
  const { id } = req.params;
  const appointments = await prisma.appointment.findMany({
    where: { company_id: Number(id), is_booked: false },
  });
  res.json(appointments);
});

app.use("/api/v1/user", UserRouter);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
