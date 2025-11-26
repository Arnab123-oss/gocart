import { clerkClient } from "@clerk/nextjs/server";

const authAdmin = async (userId) => {
  try {

    console.log("user in authAdmin -- " + userId);
    if (!userId) return false;
       
    const user = await clerkClient.users.getUser(userId); // FIXED

    const adminEmails = process.env.ADMIN_EMAIL?.split(",").map((e) =>
      e.trim().toLowerCase()
    );

    const userEmail = user.emailAddresses[0].emailAddress.toLowerCase();
    console.log("user" + userEmail + process.env.ADMIN_EMAIL);
    return adminEmails.includes(userEmail);
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return false;
  }
};

export default authAdmin;
// import { clerkClient } from "@clerk/nextjs/server";

// const authAdmin = async (userId) => {
//   try {
//     if (!userId) return false;

//     const client = await clerkClient();
//     const user = await client.users.getUser(userId);
//     console.log(process.env.ADMIN_EMAIL);
//     return process.env.ADMIN_EMAIL.split(",").includes(
//       user.emailAddresses[0].emailAddress
//     );
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };

// export default authAdmin;

