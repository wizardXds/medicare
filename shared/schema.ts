import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (patients, doctors, admins)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dob: text("dob"),
  role: text("role").notNull().default("patient"), // "patient", "doctor", "admin"
  specialty: text("specialty"), // Only for doctors
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Hospitals
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: text("date").notNull(), // Store as ISO string
  time: text("time").notNull(),
  duration: integer("duration").default(30), // Duration in minutes
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled", "completed"
  type: text("type").notNull().default("in-person"), // "in-person", "video", "phone"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Medical Records
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  recordType: text("record_type").notNull(), // "consultation", "lab_result", "prescription", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
});

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  instructions: text("instructions"),
  status: text("status").notNull().default("active"), // "active", "completed", "cancelled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  appointmentId: integer("appointment_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed", "refunded"
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
