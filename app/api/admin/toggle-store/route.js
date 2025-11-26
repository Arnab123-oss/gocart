import prisma from "@/lib/prisma";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Toggle store isActive

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeId } = await request.json();
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }
    //Find the store

    const store = await prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    });

    return NextResponse.json({message:"Store updated successfully"});


  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
