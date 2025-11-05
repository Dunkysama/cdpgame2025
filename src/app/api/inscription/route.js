import { NextResponse } from "next/server";
import { registerUser } from "../../inscription/inscription_back.js";

export async function POST(req) {
  const data = await req.json();
  const { status, body } = await registerUser(data);
  return NextResponse.json(body, { status });
}