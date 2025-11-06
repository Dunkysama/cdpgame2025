import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req) {
  try {
    // Auth requise
    const jar = await cookies();
    const token = jar.get("session")?.value;
    const payload = token ? await verifySessionToken(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    let pseudo = (form.get("pseudo") || "").toString();
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    // Sanitize pseudo pour le nom de fichier
    if (!pseudo) pseudo = payload.username || `user_${payload.sub}`;
    const safePseudo = pseudo
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire accents
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "");

    // Générer nom: pseudo_5digits_YYYY-MM-DD_HH-mm-ss.ext
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const rand = String(Math.floor(Math.random() * 100000)).padStart(5, "0");

    const origName = file.name || "upload";
    const ext = path.extname(origName) || mimetypeToExt(file.type) || ".png";
    const filename = `${safePseudo || "profil"}_${rand}_${stamp}${ext}`;

    const publicDir = path.join(process.cwd(), "public", "profil_image");
    await fs.mkdir(publicDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const destPath = path.join(publicDir, filename);
    await fs.writeFile(destPath, buffer);

    const publicPath = `/profil_image/${filename}`;
    return NextResponse.json({ ok: true, path: publicPath });
  } catch (err) {
    console.error("/api/profil/image POST error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function mimetypeToExt(type) {
  if (!type) return null;
  const map = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return map[type] || null;
}
