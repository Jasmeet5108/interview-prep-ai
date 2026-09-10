import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/auth/session";

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());

    await connectDB();

    const existingUser = await User.findOne({
      email: input.email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      email: input.email,
      password: passwordHash,
    });

    await createSession(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message,
        },
        { status: 400 },
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
      },
      { status: 500 },
    );
  }
}
