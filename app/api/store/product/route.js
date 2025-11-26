import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import ImageKit from "@imagekit/nodejs";
import { NextResponse } from "next/server";


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // <-- FIXED
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Add a new product

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // Get the data from the form

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("descriptionn");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const images = formData.getAll("images");

    if (
      !name ||
      !description ||
      !mrp ||
      !price ||
      !category ||
      !images ||
      images.length < 1
    ) {
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    // uploading images to image kit

    const imageUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
          file: buffer,
          filename: image.name,
          folder: "products",
        });

        const url = imagekit.url({
          path: response.filepath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
        return url;
      })
    );

    await prisma.product.create({
      dara: {
        name,
        description,
        mrp,
        price,
        category,
        images: imageUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}


// Get all products for a seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "not authorized" },
        { status: 401 }
      );
    }

    // 👉 If authorized, fetch seller products
    const products = await prisma.product.findMany({
      where: {
        storeId: storeId,
      },
    });

    return NextResponse.json(products, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}



