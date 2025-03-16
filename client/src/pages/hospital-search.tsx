import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Hospital, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  UserCog,
  Star,
  StarHalf
} from "lucide-react";
import { Link } from "wouter";

// Specialties list
const specialties = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Ophthalmology",
  "Gynecology",
  "Oncology",
  "Urology",
  "Psychiatry"
];

export default function HospitalSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  
  // Fetch hospitals
  const { data: hospitals = [], isLoading: isLoadingHospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
    enabled: true,
  });

  // Fetch doctors
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery<User[]>({
    queryKey: ["/api/doctors"],
    enabled: true,
  });
  
  // Apply filters to hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = searchQuery 
      ? hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCity = selectedCity !== "All Cities"
      ? hospital.city === selectedCity 
      : true;
    
    return matchesSearch && matchesCity;
  });
  
  // Apply filters to doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery 
      ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesSpecialty = selectedSpecialty !== "All Specialties"
      ? doctor.specialty === selectedSpecialty
      : true;
    
    return matchesSearch && matchesSpecialty;
  });
  
  // Get unique cities from hospitals
  const cities = Array.from(new Set(hospitals.map(hospital => hospital.city)));

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Find Healthcare</h1>
            <p className="text-neutral-500">Search for hospitals and doctors in your area</p>
          </div>
          
          {/* Search Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input 
                    placeholder="Search by name, location, or specialty..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Cities">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Results Section */}
          <Tabs defaultValue="hospitals">
            <TabsList className="mb-6">
              <TabsTrigger value="hospitals" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Hospitals</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>Doctors</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hospitals">
              {isLoadingHospitals ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <EmptyState 
                  icon={<Building2 className="h-8 w-8 text-neutral-400" />}
                  title="No hospitals found"
                  description="Try adjusting your search criteria or browse all hospitals"
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHospitals.map((hospital) => (
                    <HospitalCard key={hospital.id} hospital={hospital} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="doctors">
              {isLoadingDoctors ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <EmptyState 
                  icon={<Users className="h-8 w-8 text-neutral-400" />}
                  title="No doctors found"
                  description="Try adjusting your search criteria or browse all doctors"
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Hospital Card Component
function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
        <Building2 className="h-16 w-16 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{hospital.name}</CardTitle>
        <div className="flex items-center text-yellow-500 mt-1">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <StarHalf className="h-4 w-4 fill-current" />
          <span className="ml-2 text-sm text-neutral-500">(48 reviews)</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start">
          <MapPin className="h-4 w-4 text-neutral-400 mt-1 mr-2 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{hospital.phone || "Not available"}</span>
        </div>
        {hospital.email && (
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-neutral-600">{hospital.email}</span>
          </div>
        )}
        {hospital.website && (
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
            <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              {hospital.website.replace(/(^\w+:|^)\/\//, "")}
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          24/7 Emergency
        </Badge>
        <Link href="/appointment-booking">
          <Button size="sm">Book Appointment</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Doctor Card Component
function DoctorCard({ doctor }: { doctor: User }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center justify-center h-48 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-32 h-32 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 text-2xl font-medium">
          {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>Dr. {doctor.firstName} {doctor.lastName}</CardTitle>
        <CardDescription>
          {doctor.specialty || "General Practitioner"}
        </CardDescription>
        <div className="flex items-center text-yellow-500 mt-1">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <span className="ml-2 text-sm text-neutral-500">(32 reviews)</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {doctor.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-neutral-600">{doctor.phone}</span>
          </div>
        )}
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{doctor.email}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm text-neutral-600 line-clamp-2">
            {doctor.bio || "Experienced healthcare professional dedicated to providing quality patient care."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Accepting New Patients
        </Badge>
        <Link href={`/appointment-booking?doctorId=${doctor.id}`}>
          <Button size="sm">Book Appointment</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Empty State Component
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
