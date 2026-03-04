// prisma-test.js
//ESM=====================================================
// import { prisma } from "./src/lib/prisma.js";

// async function main() {
//   console.log("Testing Prisma connection...");

//   // 1️⃣ Create a sample user
//   const user = await prisma.user.create({
//     data: {
//       email: "testuser@example.com",
//       password: "password123",
//       profile: {
//         create: {
//           fullName: "Test User",
//           department: "IT",
//         },
//       },
//       logEntries: {
//         create: [
//           { description: "First log entry", hours: 2 },
//           { description: "Second log entry", hours: 3 },
//         ],
//       },
//       checklist: {
//         create: [
//           { item: "Complete orientation", completed: true },
//           { item: "Submit ID card", completed: false },
//         ],
//       },
//     },
//     include: {
//       profile: true,
//       logEntries: true,
//       checklist: true,
//     },
//   });

//   console.log("Created user with related data:");
//   console.log(JSON.stringify(user, null, 2));

//   // 2️⃣ Read all users
//   const users = await prisma.user.findMany({
//     include: {
//       profile: true,
//       logEntries: true,
//       checklist: true,
//     },
//   });

//   console.log("All users in DB:");
//   console.log(JSON.stringify(users, null, 2));
// }

// main()
//   .then(async () => {
//     console.log("Test finished ✅");
//     await prisma.$disconnect();
//   })
//   .catch(async (err) => {
//     console.error("Error during test ❌", err);
//     await prisma.$disconnect();
//   });


//CommonJS=======================================================

// prisma-test.js
const prisma = require("./src/lib/prisma");

async function main() {
  console.log("Testing Prisma connection...");
  const users = await prisma.user.findMany();
  console.log(users);
}

main()
  .then(async () => {
    console.log("Test finished ✅");
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Error during test ❌", err);
    await prisma.$disconnect();
  });