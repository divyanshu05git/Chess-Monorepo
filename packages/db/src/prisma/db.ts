import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contract: contractJson as unknown as Contract,
  // url: process.env['DATABASE_URL']!,
});

export const connectDb = async () => {
  await db.connect({
    url: process.env['DATABASE_URL']!,
  });
};
