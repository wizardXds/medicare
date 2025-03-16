import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Appointment, MedicalRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Link } from "wouter";
import { CalendarCheck, FileText, Pill, TestTube, Bell } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  
  // Fetch appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?patientId=${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch medical records
  const { data: medicalRecords = [] } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/medical-records?patientId=${user?.id}`],
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Patient Dashboard</h1>
            <p className="text-neutral-500">Welcome back, {user?.firstName}! Here's your health summary.</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Upcoming Appointments" 
              value={appointments.filter(a => a.status !== "completed" && a.status !== "cancelled").length} 
              icon={<CalendarCheck className="text-primary" />}
              footer={appointments.length > 0 ? `Next: ${appointments[0].date}` : "No upcoming appointments"}
            />
            
            <StatsCard 
              title="Active Prescriptions" 
              value={2} 
              icon={<Pill className="text-green-500" />}
              footer="Last updated: June 10"
            />
            
            <StatsCard 
              title="Recent Lab Tests" 
              value={1} 
              icon={<TestTube className="text-orange-500" />}
              footer="Results available"
            />
            
            <StatsCard 
              title="Unread Messages" 
              value={2} 
              icon={<Bell className="text-red-500" />}
              footer="From Dr. Smith, Dr. Williams"
            />
          </div>
          
          {/* Upcoming Appointments & Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Upcoming Appointments</h2>
                <Link href="/appointment-booking">
                  <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <EmptyState 
                    message="You don't have any upcoming appointments" 
                    description="Schedule a consultation with a doctor to get started."
                  />
                ) : (
                  appointments.slice(0, 2).map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </div>
              
              <Link href="/appointment-booking">
                <Button className="mt-5 w-full border border-dashed border-primary text-primary hover:bg-primary-light hover:bg-opacity-5 font-medium py-3 rounded-lg transition-colors">
                  <CalendarCheck className="h-4 w-4 mr-2" /> Book New Appointment
                </Button>
              </Link>
            </div>
            
            {/* Reminders & Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Reminders</h2>
                <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Pill className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-700">Medication Reminder</h3>
                    <p className="text-sm text-neutral-500">Take Lisinopril 10mg at 8:00 PM</p>
                    <p className="text-xs text-neutral-400 mt-1">Daily</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-700">Lab Test Scheduled</h3>
                    <p className="text-sm text-neutral-500">Blood work at City Medical Lab</p>
                    <p className="text-xs text-neutral-400 mt-1">June 20, 9:00 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-700">Health Goal Reminder</h3>
                    <p className="text-sm text-neutral-500">30 minutes of walking today</p>
                    <p className="text-xs text-neutral-400 mt-1">In progress (15 min completed)</p>
                  </div>
                </div>
              </div>
              
              <Button className="mt-5 w-full border border-dashed border-primary text-primary hover:bg-primary-light hover:bg-opacity-5 font-medium py-3 rounded-lg transition-colors">
                <Bell className="h-4 w-4 mr-2" /> Add Reminder
              </Button>
            </div>
          </div>
          
          {/* Recent Medical Records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Recent Medical Records</h2>
                <Link href="/medical-records">
                  <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium">
                    View All
                  </Button>
                </Link>
              </div>
              
              {medicalRecords.length === 0 ? (
                <EmptyState 
                  message="No medical records found" 
                  description="Your medical history will appear here once a doctor uploads them."
                />
              ) : (
                <DataTable 
                  data={medicalRecords}
                  columns={[
                    {
                      header: "Type",
                      accessorKey: "recordType",
                      cell: (record) => (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm text-neutral-700">{record.recordType}</span>
                        </div>
                      ),
                    },
                    {
                      header: "Description",
                      accessorKey: "description",
                    },
                    {
                      header: "Date",
                      accessorKey: "date",
                    },
                    {
                      header: "Action",
                      accessorKey: "id",
                      cell: (record) => (
                        <Link href={`/medical-records/${record.id}`}>
                          <Button variant="link" className="text-primary hover:text-primary-dark">
                            View
                          </Button>
                        </Link>
                      ),
                    },
                  ]}
                />
              )}
            </div>
            
            {/* Find a Doctor */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Find a Doctor</h2>
                <Link href="/hospitals">
                  <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium">
                    Advanced Search
                  </Button>
                </Link>
              </div>
              
              <form className="mb-4">
                <div className="relative">
                  <input type="text" className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Search by specialty or doctor name" />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="specialty" className="block text-sm font-medium text-neutral-600 mb-1">Specialty</label>
                  <select id="specialty" name="specialty" className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                    <option value="">All Specialties</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="date" className="block text-sm font-medium text-neutral-600 mb-1">Date</label>
                  <input type="date" id="date" name="date" className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                
                <Button type="submit" className="mt-4 w-full">Search Doctors</Button>
              </form>
              
              <div className="mt-5 pt-5 border-t border-neutral-200">
                <h3 className="font-medium text-neutral-700 mb-3">Popular Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  <Link href="/hospitals?specialty=cardiology">
                    <a className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-light hover:text-primary transition-colors">
                      Cardiology
                    </a>
                  </Link>
                  <Link href="/hospitals?specialty=dermatology">
                    <a className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-light hover:text-primary transition-colors">
                      Dermatology
                    </a>
                  </Link>
                  <Link href="/hospitals?specialty=orthopedics">
                    <a className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-light hover:text-primary transition-colors">
                      Orthopedics
                    </a>
                  </Link>
                  <Link href="/hospitals?specialty=pediatrics">
                    <a className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-light hover:text-primary transition-colors">
                      Pediatrics
                    </a>
                  </Link>
                  <Link href="/hospitals?specialty=neurology">
                    <a className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-light hover:text-primary transition-colors">
                      Neurology
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  footer: string;
}

function StatsCard({ title, value, icon, footer }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">{title}</p>
            <p className="font-bold text-2xl text-neutral-700">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="text-sm text-neutral-500 mt-2">{footer}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message, description }: { message: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
        <FileText className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium text-neutral-700">{message}</h3>
      <p className="text-sm text-neutral-500 mt-1 max-w-md">{description}</p>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center">
            <span className="text-neutral-600 font-medium">DR</span>
          </div>
          <div>
            <h3 className="font-medium text-neutral-700">Dr. James Wilson</h3>
            <p className="text-sm text-neutral-500">Cardiology</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center text-xs text-neutral-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center text-xs text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            appointment.status === "confirmed" 
              ? "bg-green-100 text-green-800" 
              : appointment.status === "pending"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
          <Button variant="ghost" size="sm" className="text-sm text-neutral-500 hover:text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </Button>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Button className="flex-1 bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 rounded transition-colors">
          Join Video Call
        </Button>
        <Button variant="outline" className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium py-2 rounded transition-colors">
          Reschedule
        </Button>
      </div>
    </div>
  );
}
