// import request from "supertest";
import jwt from "jsonwebtoken";
import { generateTokens } from "./auth"; // ścieżka do pliku z funkcją
import { User } from "./types/user";
// import { app } from "./server";

// Ustawienie zmiennych środowiskowych lub zamockowanie tajnych kluczy
const JWT_SECRET = "secret_key";
const JWT_REFRESH_SECRET = "refresh_secret_key";

describe("generateTokens", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
  };

  it("should return an access token and refresh token", () => {
    const { accessToken, refreshToken } = generateTokens(mockUser);

    // Sprawdzenie, czy tokeny zostały wygenerowane
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it("should generate a valid access token with 1-hour expiration", () => {
    const { accessToken } = generateTokens(mockUser);
    const decodedToken = jwt.verify(accessToken, JWT_SECRET) as jwt.JwtPayload;

    // Sprawdzenie poprawności danych i wygaśnięcia access tokena
    expect(decodedToken.email).toBe(mockUser.email);
    expect(decodedToken.id).toBe(mockUser.id);
    expect(decodedToken.exp).toBeDefined();

    // Sprawdzenie, czy czas wygaśnięcia wynosi około 1 godziny
    const currentTime = Math.floor(Date.now() / 1000);
    expect(decodedToken.exp! - currentTime).toBeLessThanOrEqual(3600);
  });

  it("should generate a valid refresh token with 7-day expiration", () => {
    const { refreshToken } = generateTokens(mockUser);
    const decodedToken = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET
    ) as jwt.JwtPayload;

    // Sprawdzenie poprawności danych i wygaśnięcia refresh tokena
    expect(decodedToken.email).toBe(mockUser.email);
    expect(decodedToken.id).toBe(mockUser.id);
    expect(decodedToken.exp).toBeDefined();

    // Sprawdzenie, czy czas wygaśnięcia wynosi około 7 dni
    const currentTime = Math.floor(Date.now() / 1000);
    expect(decodedToken.exp! - currentTime).toBeLessThanOrEqual(
      7 * 24 * 60 * 60
    );
  });
});

// describe("refreshToken", () => {
//   const mockUser = { id: 1, email: "test@example.com" };
//   const validRefreshToken = jwt.sign(mockUser, JWT_REFRESH_SECRET, {
//     expiresIn: "7d",
//   });
//   const expiredRefreshToken = jwt.sign(mockUser, JWT_REFRESH_SECRET, {
//     expiresIn: "-1s",
//   });

//   it("should return 401 if no refresh token is provided", async () => {
//     const response = await request(app).post("/refresh-token").send();
//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe("Refresh token required");
//   });

//   it("should return 401 if refresh token is invalid", async () => {
//     const response = await request(app)
//       .post("/refresh-token")
//       .send({ refreshToken: "invalidToken" });
//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe("Invalid or expired refresh token");
//   });

//   it("should return 401 if refresh token is expired", async () => {
//     const response = await request(app)
//       .post("/refresh-token")
//       .send({ refreshToken: expiredRefreshToken });
//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe("Invalid or expired refresh token");
//   });

//   it("should return a new access token if refresh token is valid", async () => {
//     const response = await request(app)
//       .post("/refresh-token")
//       .send({ refreshToken: validRefreshToken });
//     expect(response.status).toBe(200);
//     expect(response.body.accessToken).toBeDefined();

//     // Dekodowanie i weryfikacja access tokena
//     const decodedAccessToken = jwt.verify(
//       response.body.accessToken,
//       JWT_SECRET
//     ) as jwt.JwtPayload;
//     expect(decodedAccessToken.id).toBe(mockUser.id);
//     expect(decodedAccessToken.email).toBe(mockUser.email);
//   });
// });
