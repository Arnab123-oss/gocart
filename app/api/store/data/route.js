import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


//get a store info and store data


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username").toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "missing usernsme" }, { status: 400 });
    }

    // Get store info and inStock products with ratings

    const store = await prisma.store.findUnique({
      where: { username, isActive: true },
      include: { Product: { include: { rating: true } } },
    });

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 400 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
