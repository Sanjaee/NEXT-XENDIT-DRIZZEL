import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  decimal,
  real,
} from "drizzle-orm/pg-core";

// Enums
export const userTypeEnum = pgEnum("user_type", ["member", "admin", "moderator"]);
export const loginTypeEnum = pgEnum("login_type", ["credential", "google"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// Users table - sesuai dengan interface User di types/auth.ts
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  phone: varchar("phone", { length: 20 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  password: text("password"), // nullable for Google OAuth users
  userType: userTypeEnum("user_type").default("member").notNull(),
  profilePhoto: text("profile_photo"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: genderEnum("gender"),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  lastLogin: timestamp("last_login"),
  loginType: loginTypeEnum("login_type").default("credential").notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table - untuk refresh tokens
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// OTP Codes table - untuk verifikasi email dan reset password
export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "email_verification" | "password_reset"
  isUsed: boolean("is_used").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verification tokens table - untuk email verification link
export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // "email_verification" | "password_reset"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table - sesuai Go Product model (XenCommerce)
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table - Xendit payment records, relasi ke user (harus login untuk checkout)
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  referenceId: varchar("reference_id", { length: 255 }).notNull().unique(),
  paymentRequestId: varchar("payment_request_id", { length: 255 }),
  channelCode: varchar("channel_code", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  country: varchar("country", { length: 10 }).notNull().default("ID"),
  currency: varchar("currency", { length: 10 }).notNull(),
  amount: real("amount").notNull().default(0),
  requestAmount: real("request_amount").notNull().default(0),
  status: varchar("status", { length: 50 }),
  description: text("description"),
  checkoutUrl: text("checkout_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
