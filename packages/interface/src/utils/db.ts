/* eslint-disable @typescript-eslint/no-shadow */
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

/**
 * Initialize the database
 * @returns the database
 */
export const initDb = async (): Promise<void> => {
  const db = await open({
    filename: "./db.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id integer primary key,
      pcd TEXT UNIQUE
    )
  `);
};

/**
 * Get the database
 * @returns the database
 */
export const getDb = async (): Promise<Database> => {
  await initDb();
  return open({
    filename: "./db.db",
    driver: sqlite3.Database,
  });
};
