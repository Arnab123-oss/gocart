import authAdmin from "@/middlewares/authAdmin";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Auth Admin

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // const user = await clerkClient.users.getUser(userId);
    // console.log("isadmin" + userId);

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role;
    

    return NextResponse.json({
      isAdmin: role === "admin",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
