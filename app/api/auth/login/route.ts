import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());

    await connectDB();

    const user = await User.findOne({
      email: input.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(input.password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    await createSession(user._id.toString());

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid login data",
        },
        { status: 400 },
      );
    }

    console.error("Login failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
      },
      { status: 500 },
    );
  }
}
