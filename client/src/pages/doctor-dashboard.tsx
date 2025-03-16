import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Appointment, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { 
  CalendarCheck, 
  Users, 
  Clock, 
  Activity,
  Calendar,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Fetch doctor's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?doctorId=${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch doctor's patients
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery<User[]>({
    queryKey: [`/api/users?doctorId=${user?.id}&role=patient`],
    enabled: !!user?.id,
  });

  // Filter today's appointments
  const todayAppointments = appointments.filter(
    appointment => appointment.date === selectedDate
  );

  const upcomingAppointments = appointments.filter(
    appointment => 
      new Date(appointment.date) >= new Date() && 
      appointment.status !== "cancelled" && 
      appointment.status !== "completed"
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Doctor Dashboard</h1>
            <p className="text-neutral-500">Welcome back, Dr. {user?.lastName}! Here's your schedule and patient summary.</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Today's Appointments" 
              value={todayAppointments.length} 
              icon={<CalendarCheck className="text-primary" />}
              footer={`${todayAppointments.filter(a => a.status === "confirmed").length} confirmed`}
            />
            
            <StatsCard 
              title="Total Patients" 
              value={patients.length} 
              icon={<Users className="text-green-500" />}
              footer="View patient list"
            />
            
            <StatsCard 
              title="Avg. Wait Time" 
              value="15m" 
              icon={<Clock className="text-orange-500" />}
              footer="Last week: 18m"
            />
            
            <StatsCard 
              title="Available Hours" 
              value="28h" 
              icon={<Activity className="text-blue-500" />}
              footer="This week"
            />
          </div>
          
          {/* Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Today's Schedule</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 border border-neutral-300 rounded"
                />
              </div>
              
              {isLoadingAppointments ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <Calendar className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700">No appointments scheduled</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-md">
                    There are no appointments scheduled for today. Enjoy your free time or update your availability.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Doctor's Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">My Schedule</h2>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm" className="text-primary">Manage</Button>
                </Link>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-sm text-neutral-600 mb-2">WEEKLY AVAILABILITY</h3>
                <div className="grid grid-cols-7 gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">{day}</div>
                      <div className={`h-8 w-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                        index < 5 ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {index < 5 ? "✓" : "–"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-4 mb-4">
                <h3 className="font-medium text-sm text-neutral-600 mb-2">WORKING HOURS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Monday - Friday</span>
                    <span className="text-neutral-800 font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Lunch Break</span>
                    <span className="text-neutral-800 font-medium">1:00 PM - 2:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-4">
                <h3 className="font-medium text-sm text-neutral-600 mb-2">UPCOMING LEAVE</h3>
                <div className="border border-neutral-200 rounded-md p-3 bg-neutral-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-700">Medical Conference</span>
                    <Badge variant="outline" className="text-neutral-600">Approved</Badge>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">June 15 - June 17, 2023</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Patient Management */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <Tabs defaultValue="upcoming">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg text-neutral-700">Patient Management</h2>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="patients">My Patients</TabsTrigger>
                  <TabsTrigger value="records">Recent Records</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="upcoming">
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                      <Calendar className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-700">No upcoming appointments</h3>
                    <p className="text-sm text-neutral-500 mt-1 max-w-md">
                      You have no upcoming appointments scheduled. Check back later or update your availability.
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    data={upcomingAppointments}
                    columns={[
                      {
                        header: "Patient",
                        accessorKey: "patientId",
                        cell: () => (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 mr-3 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">SJ</span>
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">Sarah Johnson</div>
                              <div className="text-xs text-neutral-500">Patient ID: P10042</div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Date & Time",
                        accessorKey: "date",
                        cell: (appointment) => (
                          <div>
                            <div className="text-neutral-700">{appointment.date}</div>
                            <div className="text-xs text-neutral-500">{appointment.time}</div>
                          </div>
                        ),
                      },
                      {
                        header: "Type",
                        accessorKey: "type",
                        cell: (appointment) => (
                          <Badge variant="outline" className="capitalize">
                            {appointment.type}
                          </Badge>
                        ),
                      },
                      {
                        header: "Status",
                        accessorKey: "status",
                        cell: (appointment) => (
                          <Badge className={`capitalize ${
                            appointment.status === "confirmed" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : appointment.status === "pending"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-100"
                          }`}>
                            {appointment.status}
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        cell: (appointment) => (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <FileText className="h-4 w-4 mr-1" /> Notes
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Calendar className="h-4 w-4 mr-1" /> Reschedule
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="patients">
                {isLoadingPatients ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                      <Users className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-700">No patients assigned</h3>
                    <p className="text-sm text-neutral-500 mt-1 max-w-md">
                      You don't have any patients assigned to you yet. They will appear here once assigned.
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    data={patients}
                    columns={[
                      {
                        header: "Patient",
                        accessorKey: "lastName",
                        cell: (patient) => (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 mr-3 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">{patient.firstName} {patient.lastName}</div>
                              <div className="text-xs text-neutral-500">{patient.email}</div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Last Visit",
                        accessorKey: "id",
                        cell: () => "May 25, 2023"
                      },
                      {
                        header: "Phone",
                        accessorKey: "phone",
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        cell: (patient) => (
                          <div className="flex space-x-2">
                            <Link href={`/medical-records?patientId=${patient.id}`}>
                              <Button variant="ghost" size="sm" className="h-8">
                                <FileText className="h-4 w-4 mr-1" /> Records
                              </Button>
                            </Link>
                            <Link href={`/appointment-booking?patientId=${patient.id}`}>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Calendar className="h-4 w-4 mr-1" /> Schedule
                              </Button>
                            </Link>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="records">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <FileText className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700">Recent medical records will appear here</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-md">
                    View patient records you've recently created or accessed for quick reference.
                  </p>
                  <Link href="/medical-records">
                    <Button className="mt-4">View All Records</Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
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

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center">
            <span className="text-neutral-600 font-medium">SJ</span>
          </div>
          <div>
            <h3 className="font-medium text-neutral-700">Sarah Johnson</h3>
            <p className="text-sm text-neutral-500">Patient ID: P10042</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center text-xs text-neutral-600 mr-4">
                <Clock className="h-3 w-3 mr-1" />
                <span>{appointment.time}</span>
              </div>
              <Badge className={`capitalize text-xs ${
                appointment.status === "confirmed" 
                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                  : appointment.status === "pending"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-100"
              }`}>
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Badge variant="outline" className="capitalize">
            {appointment.type}
          </Badge>
          <div className="text-sm text-right font-medium">
            {appointment.duration} min
          </div>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2 rounded transition-colors">
          Start Consultation
        </Button>
        <Button variant="outline" className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium py-2 rounded transition-colors">
          View Details
        </Button>
      </div>
    </div>
  );
}
