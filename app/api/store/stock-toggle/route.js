import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


// toggle stock of a product

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const { productId } = await request.json();

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { error: "missing details: productId" },
        { status: 400 }
      );
    }

    // Validate seller
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // Get product first
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    // Toggle stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        inStock: !product.inStock,
      },
    });

    return NextResponse.json(
      { message: "Product stock updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
