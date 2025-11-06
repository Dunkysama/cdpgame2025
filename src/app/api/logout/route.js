import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";
/*
export async function POST() {
  // Tente de lire et logguer la session avant suppression
  const store = await cookies();
  const token = store.get("session")?.value;
  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      console.log("[session] logout", {
        jti: payload.jti,
        user: { id: payload.sub, username: payload.username, email: payload.email },
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  // Invalide le cookie de session (chemin racine)
  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  // Par sécurité, invalide aussi une éventuelle variante au chemin /connexion
  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/connexion",
    expires: new Date(0),
  });
  return res;
}

// Optionnellement supporter GET aussi
export const GET = POST;
*/

export async function POST() {
  // Répond et supprime le cookie session (tous attributs alignés)
  const res = NextResponse.json({ ok: true });
  const common = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  res.cookies.set("session", "", { ...common, maxAge: 0, expires: new Date(0) });
  return res;
}

// Optionnel: permettre aussi GET /api/logout
export const GET = POST;
