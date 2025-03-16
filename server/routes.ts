import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertAppointmentSchema,
  insertMedicalRecordSchema,
  insertPrescriptionSchema,
  insertMessageSchema,
  insertPaymentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // User related routes (beyond authentication)
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getUsersByRole("doctor");
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Hospital routes
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const hospital = await storage.getHospital(parseInt(req.params.id));
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospital" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      let appointments = [];
      const { patientId, doctorId } = req.query;

      if (patientId && typeof patientId === 'string') {
        appointments = await storage.getAppointmentsByPatient(parseInt(patientId));
      } else if (doctorId && typeof doctorId === 'string') {
        appointments = await storage.getAppointmentsByDoctor(parseInt(doctorId));
      } else {
        return res.status(400).json({ error: "Either patientId or doctorId query parameter is required" });
      }

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(parseInt(req.params.id));
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create appointment" });
      }
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // Medical Record routes
  app.get("/api/medical-records", async (req, res) => {
    try {
      const { patientId } = req.query;
      
      if (!patientId || typeof patientId !== 'string') {
        return res.status(400).json({ error: "PatientId query parameter is required" });
      }
      
      const records = await storage.getMedicalRecordsByPatient(parseInt(patientId));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical records" });
    }
  });

  app.get("/api/medical-records/:id", async (req, res) => {
    try {
      const record = await storage.getMedicalRecord(parseInt(req.params.id));
      if (!record) {
        return res.status(404).json({ error: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical record" });
    }
  });

  app.post("/api/medical-records", async (req, res) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create medical record" });
      }
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", async (req, res) => {
    try {
      let prescriptions = [];
      const { patientId, doctorId } = req.query;

      if (patientId && typeof patientId === 'string') {
        prescriptions = await storage.getPrescriptionsByPatient(parseInt(patientId));
      } else if (doctorId && typeof doctorId === 'string') {
        prescriptions = await storage.getPrescriptionsByDoctor(parseInt(doctorId));
      } else {
        return res.status(400).json({ error: "Either patientId or doctorId query parameter is required" });
      }

      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/prescriptions/:id", async (req, res) => {
    try {
      const prescription = await storage.getPrescription(parseInt(req.params.id));
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prescription" });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create prescription" });
      }
    }
  });

  app.patch("/api/prescriptions/:id", async (req, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const prescription = await storage.getPrescription(prescriptionId);
      
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      
      const updatedPrescription = await storage.updatePrescription(prescriptionId, req.body);
      res.json(updatedPrescription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update prescription" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "UserId query parameter is required" });
      }
      
      const messages = await storage.getMessagesByUser(parseInt(userId));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const { patientId } = req.query;
      
      if (!patientId || typeof patientId !== 'string') {
        return res.status(400).json({ error: "PatientId query parameter is required" });
      }
      
      const payments = await storage.getPaymentsByPatient(parseInt(patientId));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create payment" });
      }
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await storage.getPayment(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      const updatedPayment = await storage.updatePayment(paymentId, req.body);
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
