import { getDB } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, fullName } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
  }

  const db = getDB();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
  }

  const hashedPassword = await hash(password, 12);

  await db.user.create({
    data: { email, hashedPassword, fullName },
  });

  return NextResponse.json({ message: "Đăng ký thành công" });
}
