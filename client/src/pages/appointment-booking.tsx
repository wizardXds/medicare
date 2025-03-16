import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { User, InsertAppointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  Form
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { CalendarClock, CheckCircle, Clock, Users, VideoIcon, Phone, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

const appointmentTypes = [
  { id: "in-person", label: "In-Person", icon: <UserIcon className="h-5 w-5 text-blue-500" /> },
  { id: "video", label: "Video Call", icon: <VideoIcon className="h-5 w-5 text-green-500" /> },
  { id: "phone", label: "Phone Call", icon: <Phone className="h-5 w-5 text-orange-500" /> }
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", 
  "4:00 PM", "4:30 PM"
];

const appointmentSchema = z.object({
  doctorId: z.number().min(1, "Please select a doctor"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
  type: z.enum(["in-person", "video", "phone"]),
  duration: z.number().min(15).default(30),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Fetch doctors
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery<User[]>({
    queryKey: ["/api/doctors"],
    enabled: !!user?.id,
  });

  // Form definition
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: new Date(),
      time: "",
      type: "in-person",
      duration: 30,
      notes: "",
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?patientId=${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?doctorId=${form.getValues().doctorId}`] });
      setIsConfirmed(true);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Could not book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AppointmentFormValues) {
    if (!user) return;
    
    const appointment: InsertAppointment = {
      patientId: user.id,
      doctorId: data.doctorId,
      date: format(data.date, "yyyy-MM-dd"),
      time: data.time,
      duration: data.duration,
      type: data.type,
      status: "pending",
      notes: data.notes || "",
    };
    
    createAppointmentMutation.mutate(appointment);
  }

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    setSelectedDoctor(doctor || null);
    form.setValue("doctorId", parseInt(doctorId));
  };

  const goToDashboard = () => {
    if (user?.role === "patient") {
      navigate("/patient-dashboard");
    } else if (user?.role === "doctor") {
      navigate("/doctor-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Appointment Booking</h1>
            <p className="text-neutral-500">Schedule a consultation with a healthcare professional</p>
          </div>
          
          {isConfirmed ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-2">Appointment Confirmed!</h2>
                  <p className="text-neutral-600 mb-6 max-w-md">
                    Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
                  </p>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 w-full max-w-md mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neutral-500">Doctor:</span>
                      <span className="font-medium">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neutral-500">Date:</span>
                      <span className="font-medium">{format(form.getValues().date, "MMMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neutral-500">Time:</span>
                      <span className="font-medium">{form.getValues().time}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neutral-500">Type:</span>
                      <span className="font-medium capitalize">{form.getValues().type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Duration:</span>
                      <span className="font-medium">{form.getValues().duration} minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={goToDashboard}>
                      Return to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => setIsConfirmed(false)}>
                      Book Another Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="appointment" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appointment">Book Appointment</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointment">
                <Card>
                  <CardHeader>
                    <CardTitle>Book a New Appointment</CardTitle>
                    <CardDescription>
                      Fill in the details below to schedule an appointment with a healthcare professional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="doctorId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Select Doctor</FormLabel>
                                  <Select 
                                    onValueChange={(value) => handleDoctorChange(value)}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {isLoadingDoctors ? (
                                        <div className="flex justify-center p-2">
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        </div>
                                      ) : doctors.length === 0 ? (
                                        <div className="p-2 text-center text-sm text-neutral-500">
                                          No doctors available
                                        </div>
                                      ) : (
                                        doctors.map((doctor) => (
                                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                            Dr. {doctor.firstName} {doctor.lastName} {doctor.specialty ? `(${doctor.specialty})` : ''}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Appointment Type</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="grid grid-cols-3 gap-4"
                                    >
                                      {appointmentTypes.map((type) => (
                                        <FormItem key={type.id} className="space-y-0">
                                          <FormControl>
                                            <RadioGroupItem
                                              value={type.id}
                                              id={type.id}
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel
                                            htmlFor={type.id}
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-neutral-200 p-4 hover:bg-neutral-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                          >
                                            {type.icon}
                                            <span className="mt-2 text-sm font-medium">{type.label}</span>
                                          </FormLabel>
                                        </FormItem>
                                      ))}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    defaultValue={field.value.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select duration" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="15">15 minutes</SelectItem>
                                      <SelectItem value="30">30 minutes</SelectItem>
                                      <SelectItem value="45">45 minutes</SelectItem>
                                      <SelectItem value="60">60 minutes</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Briefly describe your symptoms or reason for visit"
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => 
                                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                        date.getDay() === 0 ||
                                        date.getDay() === 6
                                      }
                                      className="rounded-md border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time</FormLabel>
                                  <div className="grid grid-cols-2 gap-2">
                                    {timeSlots.map((timeSlot) => (
                                      <Button
                                        key={timeSlot}
                                        type="button"
                                        variant={field.value === timeSlot ? "default" : "outline"}
                                        className="justify-start"
                                        onClick={() => field.onChange(timeSlot)}
                                      >
                                        <Clock className="mr-2 h-4 w-4" />
                                        {timeSlot}
                                      </Button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <CardFooter className="flex justify-between px-0">
                          <Button type="button" variant="outline" onClick={goToDashboard}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createAppointmentMutation.isPending}
                            className="space-x-2"
                          >
                            {createAppointmentMutation.isPending && (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            )}
                            <span>Book Appointment</span>
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <UpcomingAppointments userId={user?.id} userRole={user?.role} />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}

function UpcomingAppointments({ userId, userRole }: { userId?: number, userRole?: string }) {
  const queryParam = userRole === "doctor" ? "doctorId" : "patientId";
  
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [`/api/appointments?${queryParam}=${userId}`],
    enabled: !!userId,
  });
  
  const upcomingAppointments = appointments.filter(
    appointment => 
      new Date(appointment.date) >= new Date() && 
      appointment.status !== "cancelled"
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          View and manage your scheduled appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <CalendarClock className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700">No upcoming appointments</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-md">
              You don't have any upcoming appointments scheduled. Book a new appointment to get started.
            </p>
            <Button className="mt-4">Book New Appointment</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary-light bg-opacity-20 flex-shrink-0 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">
                      {userRole === "doctor" ? "Patient: Sarah Johnson" : "Dr. James Wilson"}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-neutral-500">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      <span>{appointment.date} at {appointment.time}</span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs capitalize py-1 px-2 rounded-full bg-blue-100 text-blue-800">
                        {appointment.type}
                      </span>
                      <span className="text-xs ml-2 capitalize py-1 px-2 rounded-full bg-neutral-100 text-neutral-800">
                        {appointment.duration} minutes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
