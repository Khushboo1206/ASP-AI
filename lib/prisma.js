// import { PrismaClient } from "@/lib/generated/prisma";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";

// const globalForPrisma = globalThis;

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const adapter = new PrismaPg(pool);

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log: ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }

// import { PrismaClient } from "@/lib/generated/prisma";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";

// const globalForPrisma = globalThis;

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   max: 10,                  // max connections in pool
//   idleTimeoutMillis: 30000, // close idle connections after 30s
//   connectionTimeoutMillis: 10000, // timeout if can't connect in 10s
// });

// const adapter = new PrismaPg(pool);

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log: ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }


import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // max connections in pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 10000, // timeout if can't connect in 10s
});

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}