import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";

export async function GET() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Log côté serveur: session vérifiée avec son id (jti) et l'utilisateur
  console.log("[session] verified", {
    jti: payload.jti,
    user: { id: payload.sub, username: payload.username, email: payload.email },
  });

  return NextResponse.json({
    authenticated: true,
    session: {
      id: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
    },
    user: {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    },
  });
}
