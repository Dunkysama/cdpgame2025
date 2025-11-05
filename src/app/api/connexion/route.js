
import { NextResponse } from "next/server";
import { loginUser } from "../../connexion/connexion_back";
import { createSessionToken } from "@/app/utils/session";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { status, body } = await loginUser({ email, password });

    // Si l'authentification est OK, on crée un cookie de session (HTTP-only)
    if (status === 200 && body?.user) {
      const token = await createSessionToken(body.user);
      const res = NextResponse.json(body, { status });
      res.cookies.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      });
      return res;
    }

    // Sinon on renvoie simplement la réponse (erreur 4xx/5xx)
    return NextResponse.json(body, { status });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
