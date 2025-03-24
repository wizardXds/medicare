import { 
  User, 
  InsertUser, 
  Hospital, 
  InsertHospital, 
  Appointment, 
  InsertAppointment, 
  MedicalRecord, 
  InsertMedicalRecord, 
  Prescription, 
  InsertPrescription, 
  Message, 
  InsertMessage,
  Payment,
  InsertPayment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";


const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Hospital operations
  getHospital(id: number): Promise<Hospital | undefined>;
  getHospitals(): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: number, hospital: Partial<Hospital>): Promise<Hospital | undefined>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Medical Record operations
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  
  // Prescription operations
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<Prescription>): Promise<Prescription | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByPatient(patientId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hospitals: Map<number, Hospital>;
  private appointments: Map<number, Appointment>;
  private medicalRecords: Map<number, MedicalRecord>;
  private prescriptions: Map<number, Prescription>;
  private messages: Map<number, Message>;
  private payments: Map<number, Payment>;
  
  private userCurrentId: number;
  private hospitalCurrentId: number;
  private appointmentCurrentId: number;
  private medicalRecordCurrentId: number;
  private prescriptionCurrentId: number;
  private messageCurrentId: number;
  private paymentCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.hospitals = new Map();
    this.appointments = new Map();
    this.medicalRecords = new Map();
    this.prescriptions = new Map();
    this.messages = new Map();
    this.payments = new Map();
    
    this.userCurrentId = 1;
    this.hospitalCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.medicalRecordCurrentId = 1;
    this.prescriptionCurrentId = 1;
    this.messageCurrentId = 1;
    this.paymentCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data - will be removed in production
    this.initSampleData();
  }

  private initSampleData() {
    // Add a sample admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$gB.Uef264de3KMctoKm2iexMw9R6KBCfPZxBchYVUUtfSZBm4lVAa", // 'password' hashed
      firstName: "Admin",
      lastName: "User",
      email: "admin@medicare.com",
      role: "admin",
      phone: "555-123-4567",
      dob: "1980-01-01",
    });
    
    // Add sample doctors
    this.createUser({
      username: "drsmith",
      password: "$2b$10$gB.Uef264de3KMctoKm2iexMw9R6KBCfPZxBchYVUUtfSZBm4lVAa", // 'password' hashed
      firstName: "John",
      lastName: "Smith",
      email: "dr.smith@medicare.com",
      role: "doctor",
      phone: "555-111-2222",
      dob: "1975-05-15",
      specialty: "Cardiology",
      bio: "Dr. Smith is a board-certified cardiologist with over 15 years of experience in treating cardiovascular diseases."
    });
    
    this.createUser({
      username: "drjones",
      password: "$2b$10$gB.Uef264de3KMctoKm2iexMw9R6KBCfPZxBchYVUUtfSZBm4lVAa", // 'password' hashed
      firstName: "Sarah",
      lastName: "Jones",
      email: "dr.jones@medicare.com",
      role: "doctor",
      phone: "555-333-4444",
      dob: "1982-09-23",
      specialty: "Pediatrics",
      bio: "Dr. Jones specializes in pediatric care and has a passion for helping children maintain optimal health."
    });
    
    this.createUser({
      username: "drwilliams",
      password: "$2b$10$gB.Uef264de3KMctoKm2iexMw9R6KBCfPZxBchYVUUtfSZBm4lVAa", // 'password' hashed
      firstName: "Michael",
      lastName: "Williams",
      email: "dr.williams@medicare.com",
      role: "doctor",
      phone: "555-555-6666",
      dob: "1978-12-10",
      specialty: "Orthopedics",
      bio: "Dr. Williams is an orthopedic surgeon specializing in sports medicine and joint replacement surgery."
    });
    
    // Add sample hospitals
    this.createHospital({
      name: "City General Hospital",
      address: "123 Medical Blvd",
      city: "Medical City",
      state: "MC",
      zipCode: "12345",
      phone: "555-987-6543",
      email: "info@citygeneral.com",
      website: "www.citygeneral.com",
    });
    
    this.createHospital({
      name: "Memorial Medical Center",
      address: "456 Healthcare Ave",
      city: "Medical City",
      state: "MC",
      zipCode: "12345",
      phone: "555-456-7890",
      email: "contact@memorialmed.com",
      website: "www.memorialmed.com",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role,
    );
  }

  // Hospital methods
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = this.hospitalCurrentId++;
    const now = new Date();
    const hospital: Hospital = { ...insertHospital, id, createdAt: now };
    this.hospitals.set(id, hospital);
    return hospital;
  }

  async updateHospital(id: number, hospitalData: Partial<Hospital>): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (!hospital) return undefined;
    
    const updatedHospital = { ...hospital, ...hospitalData };
    this.hospitals.set(id, updatedHospital);
    return updatedHospital;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId,
    );
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId,
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const now = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt: now };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Medical Record methods
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.patientId === patientId,
    );
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.medicalRecordCurrentId++;
    const now = new Date();
    const record: MedicalRecord = { ...insertRecord, id, createdAt: now };
    this.medicalRecords.set(id, record);
    return record;
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      (prescription) => prescription.patientId === patientId,
    );
  }

  async getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      (prescription) => prescription.doctorId === doctorId,
    );
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionCurrentId++;
    const now = new Date();
    const prescription: Prescription = { ...insertPrescription, id, createdAt: now };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescription(id: number, prescriptionData: Partial<Prescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription = { ...prescription, ...prescriptionData };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId,
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.patientId === patientId,
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const now = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt: now };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
