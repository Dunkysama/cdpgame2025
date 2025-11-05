
import { NextResponse } from "next/server";
import { loginUser } from "../../connexion/connexion_back";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { status, body } = await loginUser({ email, password });
    return NextResponse.json(body, { status });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
