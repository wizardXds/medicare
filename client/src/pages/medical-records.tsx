import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MedicalRecord, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { 
  FileText, 
  FilePlus,
  Download,
  Eye,
  Pill,
  Vial,
  Stethoscope,
  FileUp,
  Search,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "wouter";

export default function MedicalRecords() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const patientIdFromParams = params.get("patientId");
  const [selectedPatientId, setSelectedPatientId] = useState<number>(
    patientIdFromParams ? parseInt(patientIdFromParams) : user?.id || 0
  );
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  
  // Fetch medical records
  const { data: medicalRecords = [], isLoading: isLoadingRecords } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/medical-records?patientId=${selectedPatientId}`],
    enabled: !!selectedPatientId,
  });

  // If doctor, fetch patients
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery<User[]>({
    queryKey: ["/api/users?role=patient"],
    enabled: user?.role === "doctor" || user?.role === "admin",
  });

  // Get selected record
  const selectedRecord = selectedRecordId 
    ? medicalRecords.find(record => record.id === selectedRecordId) 
    : null;

  // Get record type icon
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4 text-blue-500" />;
      case "lab_result":
        return <Vial className="h-4 w-4 text-purple-500" />;
      case "prescription":
        return <Pill className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  // Handle patient change
  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(parseInt(patientId));
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="font-bold text-2xl text-neutral-700">Medical Records</h1>
              <p className="text-neutral-500">
                {user?.role === "patient" 
                  ? "View and manage your medical history" 
                  : "Access and manage patient medical records"}
              </p>
            </div>
            
            {(user?.role === "doctor" || user?.role === "admin") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Medical Record</DialogTitle>
                    <DialogDescription>
                      Create a new medical record for the patient.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="record-type" className="text-right text-sm font-medium">
                        Type
                      </label>
                      <Select defaultValue="consultation">
                        <SelectTrigger id="record-type" className="col-span-3">
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="lab_result">Lab Result</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="imaging">Imaging</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="title" className="text-right text-sm font-medium">
                        Title
                      </label>
                      <Input id="title" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right text-sm font-medium">
                        Description
                      </label>
                      <Input id="description" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="date" className="text-right text-sm font-medium">
                        Date
                      </label>
                      <Input id="date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="file" className="text-right text-sm font-medium">
                        File
                      </label>
                      <div className="col-span-3">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileUp className="w-8 h-8 mb-3 text-neutral-400" />
                              <p className="mb-2 text-sm text-neutral-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-neutral-500">PDF, JPG, PNG (MAX. 10MB)</p>
                            </div>
                            <input id="file-upload" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Record</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {(user?.role === "doctor" || user?.role === "admin") && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">Select Patient:</div>
                  {isLoadingPatients ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
                    <Select 
                      onValueChange={handlePatientChange} 
                      defaultValue={selectedPatientId.toString()}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
                <TabsTrigger value="lab_results">Lab Results</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>
              
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input placeholder="Search records..." className="pl-9" />
              </div>
            </div>
            
            <TabsContent value="all">
              <RecordsTable 
                records={medicalRecords} 
                isLoading={isLoadingRecords}
                getRecordTypeIcon={getRecordTypeIcon}
                onViewRecord={(id) => setSelectedRecordId(id)}
              />
            </TabsContent>
            
            <TabsContent value="consultations">
              <RecordsTable 
                records={medicalRecords.filter(record => record.recordType === "consultation")} 
                isLoading={isLoadingRecords}
                getRecordTypeIcon={getRecordTypeIcon}
                onViewRecord={(id) => setSelectedRecordId(id)}
              />
            </TabsContent>
            
            <TabsContent value="lab_results">
              <RecordsTable 
                records={medicalRecords.filter(record => record.recordType === "lab_result")} 
                isLoading={isLoadingRecords}
                getRecordTypeIcon={getRecordTypeIcon}
                onViewRecord={(id) => setSelectedRecordId(id)}
              />
            </TabsContent>
            
            <TabsContent value="prescriptions">
              <RecordsTable 
                records={medicalRecords.filter(record => record.recordType === "prescription")} 
                isLoading={isLoadingRecords}
                getRecordTypeIcon={getRecordTypeIcon}
                onViewRecord={(id) => setSelectedRecordId(id)}
              />
            </TabsContent>
          </Tabs>
          
          {/* Record Details Dialog */}
          {selectedRecord && (
            <Dialog open={!!selectedRecordId} onOpenChange={(open) => !open && setSelectedRecordId(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    {getRecordTypeIcon(selectedRecord.recordType)}
                    <span className="ml-2">{selectedRecord.title}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Record details and documentation
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium text-neutral-500">Record Type</span>
                      <Badge className="capitalize">
                        {selectedRecord.recordType.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium text-neutral-500">Date</span>
                      <span>{selectedRecord.date}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium text-neutral-500">Doctor</span>
                      <span>Dr. James Wilson</span>
                    </div>
                    <div className="pb-2 border-b">
                      <span className="text-sm font-medium text-neutral-500 block mb-2">Description</span>
                      <p className="text-neutral-700">{selectedRecord.description}</p>
                    </div>
                    
                    {selectedRecord.fileUrl && (
                      <div className="pt-2">
                        <span className="text-sm font-medium text-neutral-500 block mb-2">Attachments</span>
                        <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-md">
                          <FileText className="h-5 w-5 text-neutral-400" />
                          <span className="text-sm text-neutral-700 flex-grow">{selectedRecord.fileUrl.split('/').pop()}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRecordId(null)}>Close</Button>
                  {(user?.role === "doctor" || user?.role === "admin") && (
                    <Button>Edit Record</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}

interface RecordsTableProps {
  records: MedicalRecord[];
  isLoading: boolean;
  getRecordTypeIcon: (type: string) => React.ReactNode;
  onViewRecord: (id: number) => void;
}

function RecordsTable({ records, isLoading, getRecordTypeIcon, onViewRecord }: RecordsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
          <FileText className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-700">No medical records found</h3>
        <p className="text-sm text-neutral-500 mt-1 max-w-md">
          Your medical history will appear here once records are added.
        </p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <DataTable 
          data={records}
          columns={[
            {
              header: "Record Type",
              accessorKey: "recordType",
              cell: (record) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                    {getRecordTypeIcon(record.recordType)}
                  </div>
                  <span className="text-sm text-neutral-700 capitalize">
                    {record.recordType.replace('_', ' ')}
                  </span>
                </div>
              ),
            },
            {
              header: "Title",
              accessorKey: "title",
              cell: (record) => (
                <div className="font-medium">{record.title}</div>
              ),
            },
            {
              header: "Date",
              accessorKey: "date",
            },
            {
              header: "Doctor",
              accessorKey: "doctorId",
              cell: () => (
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center mr-2">
                    <span className="text-xs font-medium text-neutral-600">JW</span>
                  </div>
                  <span>Dr. James Wilson</span>
                </div>
              ),
            },
            {
              header: "Actions",
              accessorKey: "id",
              cell: (record) => (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewRecord(record.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {record.fileUrl && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
