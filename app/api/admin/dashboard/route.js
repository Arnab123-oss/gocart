import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Get dashboard data for admin(total orders,total stores,total products, total revenue)

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch user from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // ✅ Check admin role
    const role = user.publicMetadata.role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //Get total orders
    const orders = await prisma.order.count();

    //Get total stores on app
    const stores = await prisma.store.count();

    // get all orders include only createdAt and total & calcutate total revenue

    const allOrders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true,
      },
    });

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      totalRevenue += order.total;
    });

    const revenue = totalRevenue.toFixed(2);
    //total product on app
    const products = await prisma.product.count();

    const dashboardData = {
      orders,
      stores,
      products,
      revenue,
      allOrders,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
