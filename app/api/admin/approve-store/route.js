import prisma from "@/lib/prisma";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Approve seller

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const client = await clerkClient();
    const admin = await client.users.getUser(userId);

    const role = admin.publicMetadata.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Not admin" }, { status: 401 });
    }

    const { storeId, status } = await request.json();

    if (status === "approved") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true },
      });
    } else if (status === "rejected") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json({ message: status + " successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// get all pending and rejected stores

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const role = user.publicMetadata.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Not admin" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: { in: ["rejected", "pending"] } },
      include: { user: true },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
