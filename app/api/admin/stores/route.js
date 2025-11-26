import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get all approve stores

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: "approved" },
      include: { user: true },
    });

    return NextResponse.json({stores});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
