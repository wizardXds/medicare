import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { User, Hospital, Appointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  CreditCard,
  UserCog,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user?.id,
  });

  // Fetch hospitals
  const { data: hospitals = [], isLoading: isLoadingHospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
    enabled: !!user?.id,
  });

  // Fetch appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/recent"],
    enabled: !!user?.id,
  });

  // Filter users by role
  const doctors = users.filter(user => user.role === "doctor");
  const patients = users.filter(user => user.role === "patient");
  const admins = users.filter(user => user.role === "admin");

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Admin Dashboard</h1>
            <p className="text-neutral-500">Welcome, {user?.firstName}! Here's an overview of the healthcare platform.</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Patients" 
              value={patients.length} 
              icon={<Users className="text-primary" />}
              footer="View all patients"
              link="/admin-dashboard/users?role=patient"
            />
            
            <StatsCard 
              title="Total Doctors" 
              value={doctors.length} 
              icon={<UserCog className="text-green-500" />}
              footer="View all doctors"
              link="/admin-dashboard/users?role=doctor"
            />
            
            <StatsCard 
              title="Hospitals" 
              value={hospitals.length} 
              icon={<Building2 className="text-orange-500" />}
              footer="View all hospitals"
              link="/admin-dashboard/hospitals"
            />
            
            <StatsCard 
              title="Total Appointments" 
              value={appointments.length} 
              icon={<CalendarCheck className="text-blue-500" />}
              footer="View all appointments"
              link="/admin-dashboard/appointments"
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-neutral-700">User Distribution</h3>
                  <PieChart className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                        <span className="text-sm">Patients: {patients.length}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Doctors: {doctors.length}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-sm">Admins: {admins.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-neutral-700">Appointment Trends</h3>
                  <BarChart3 className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500">Appointment statistics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg text-neutral-700">User Management</h2>
              <Link href="/admin-dashboard/users">
                <Button>Add New User</Button>
              </Link>
            </div>
            
            <Tabs defaultValue="doctors">
              <TabsList className="mb-4">
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="admins">Administrators</TabsTrigger>
              </TabsList>
              
              <TabsContent value="doctors">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : doctors.length === 0 ? (
                  <EmptyState 
                    icon={<UserCog className="h-8 w-8 text-neutral-400" />}
                    title="No doctors found"
                    description="There are no doctors registered in the system yet."
                  />
                ) : (
                  <DataTable 
                    data={doctors.slice(0, 5)}
                    columns={[
                      {
                        header: "Name",
                        accessorKey: "lastName",
                        cell: (doctor) => (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 mr-3 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">
                                {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">Dr. {doctor.firstName} {doctor.lastName}</div>
                              <div className="text-xs text-neutral-500">{doctor.email}</div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Specialty",
                        accessorKey: "specialty",
                        cell: (doctor) => (
                          <span className="capitalize">{doctor.specialty || "General"}</span>
                        ),
                      },
                      {
                        header: "Phone",
                        accessorKey: "phone",
                      },
                      {
                        header: "Status",
                        accessorKey: "id",
                        cell: () => (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        cell: (doctor) => (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              Deactivate
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
                
                {doctors.length > 5 && (
                  <div className="flex justify-end mt-4">
                    <Link href="/admin-dashboard/users?role=doctor">
                      <Button variant="outline">View All Doctors</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="patients">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : patients.length === 0 ? (
                  <EmptyState 
                    icon={<Users className="h-8 w-8 text-neutral-400" />}
                    title="No patients found"
                    description="There are no patients registered in the system yet."
                  />
                ) : (
                  <DataTable 
                    data={patients.slice(0, 5)}
                    columns={[
                      {
                        header: "Name",
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
                        header: "Date of Birth",
                        accessorKey: "dob",
                      },
                      {
                        header: "Phone",
                        accessorKey: "phone",
                      },
                      {
                        header: "Status",
                        accessorKey: "id",
                        cell: () => (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        cell: (patient) => (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              Deactivate
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
                
                {patients.length > 5 && (
                  <div className="flex justify-end mt-4">
                    <Link href="/admin-dashboard/users?role=patient">
                      <Button variant="outline">View All Patients</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="admins">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : admins.length === 0 ? (
                  <EmptyState 
                    icon={<Users className="h-8 w-8 text-neutral-400" />}
                    title="No administrators found"
                    description="There are no administrators registered in the system yet."
                  />
                ) : (
                  <DataTable 
                    data={admins}
                    columns={[
                      {
                        header: "Name",
                        accessorKey: "lastName",
                        cell: (admin) => (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 mr-3 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">
                                {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">{admin.firstName} {admin.lastName}</div>
                              <div className="text-xs text-neutral-500">{admin.email}</div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Email",
                        accessorKey: "email",
                      },
                      {
                        header: "Phone",
                        accessorKey: "phone",
                      },
                      {
                        header: "Status",
                        accessorKey: "id",
                        cell: () => (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        cell: (admin) => (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              Deactivate
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hospital Management */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg text-neutral-700">Hospital Management</h2>
              <Link href="/admin-dashboard/hospitals/new">
                <Button>Add Hospital</Button>
              </Link>
            </div>
            
            {isLoadingHospitals ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : hospitals.length === 0 ? (
              <EmptyState 
                icon={<Building2 className="h-8 w-8 text-neutral-400" />}
                title="No hospitals found"
                description="There are no hospitals registered in the system yet."
              />
            ) : (
              <DataTable 
                data={hospitals.slice(0, 5)}
                columns={[
                  {
                    header: "Hospital Name",
                    accessorKey: "name",
                    cell: (hospital) => (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-primary bg-opacity-20 flex-shrink-0 mr-3 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-medium text-neutral-700">{hospital.name}</div>
                      </div>
                    ),
                  },
                  {
                    header: "Location",
                    accessorKey: "city",
                    cell: (hospital) => (
                      <span>{hospital.city}, {hospital.state}</span>
                    ),
                  },
                  {
                    header: "Contact",
                    accessorKey: "phone",
                  },
                  {
                    header: "Actions",
                    accessorKey: "id",
                    cell: (hospital) => (
                      <div className="flex space-x-2">
                        <Link href={`/admin-dashboard/hospitals/${hospital.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            Edit
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                          Remove
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
            
            {hospitals.length > 5 && (
              <div className="flex justify-end mt-4">
                <Link href="/admin-dashboard/hospitals">
                  <Button variant="outline">View All Hospitals</Button>
                </Link>
              </div>
            )}
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
  link: string;
}

function StatsCard({ title, value, icon, footer, link }: StatsCardProps) {
  return (
    <Link href={link}>
      <Card className="transition-all hover:shadow-md">
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
    </Link>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-neutral-700">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1 max-w-md">{description}</p>
    </div>
  );
}
