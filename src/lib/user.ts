import sql from "better-sqlite3";
import bcrypt from "bcrypt";
import { User } from "../types/user.js";

const db = sql("posts.db");

export const getUserByEmail = (email: string): User | null => {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return user as User | null;
};

export const getUserById = (id: number): User | null => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return user as User | null;
};

export const createUser = async (
  email: string,
  password: string
): Promise<number> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users
      (email, password, createdAt, updatedAt)
    VALUES (
      @email,
      @password,
      @createdAt,
      @updatedAt
    )
  `);

  const result = stmt.run({
    email,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  return result.lastInsertRowid as number;
};

export const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const updateUser = (
  id: number,
  data: Partial<Pick<User, "email" | "password">>
): boolean => {
  const updateFields: string[] = [];
  const updateValues: any = { id };

  if (data.email) {
    updateFields.push("email = @email");
    updateValues.email = data.email;
  }

  if (data.password) {
    updateFields.push("password = @password");
    updateValues.password = data.password;
  }

  if (updateFields.length === 0) {
    return false;
  }

  updateFields.push("updatedAt = @updatedAt");
  updateValues.updatedAt = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE users
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  const result = stmt.run(updateValues);
  return result.changes === 1;
};

export const deleteUser = (id: number): boolean => {
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return result.changes === 1;
};
