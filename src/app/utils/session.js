import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const encoder = new TextEncoder();
const DEFAULT_SECRET = "change-me-in-.env.local";
const SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const secretKey = encoder.encode(SECRET);

// Crée un JWT avec les infos essentielles de l'utilisateur
export async function createSessionToken(user) {
  const jti = randomUUID();
  const payload = {
    jti,
    sub: String(user.id),
    username: user.username,
    email: user.email,
  };

  // Expiration à 7 jours par défaut
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  // Log côté serveur pour vérification: id de session (jti) + contenu utile
  console.log("[session] created", {
    jti,
    user: { id: payload.sub, username: payload.username, email: payload.email },
  });

  return token;
}

// Vérifie et décode un token; renvoie le payload ou null
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
