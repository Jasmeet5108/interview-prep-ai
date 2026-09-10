import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 401 },
    );
  }

  await connectDB();

  const user = await User.findById(session.userId).lean();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
    },
  });
}
