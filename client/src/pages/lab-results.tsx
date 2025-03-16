import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecord } from "@shared/schema";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  AlertCircle,
  ChevronRight,
  Download,
  FileText,
  FlaskConical,
  Search,
  TestTube,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LabResults() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [openSidebar, setOpenSidebar] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);

  useEffect(() => {
    setOpenSidebar(!isMobile);
  }, [isMobile]);

  const { data: labResults = [], isLoading } = useQuery({
    queryKey: ["/api/medical-records", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const queryParam = user.role === "doctor" 
        ? `doctorId=${user.id}` 
        : `patientId=${user.id}`;
      
      const response = await fetch(`/api/medical-records?${queryParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch lab results");
      }
      
      const allRecords = await response.json();
      
      // Filter out only lab test records
      return allRecords.filter((record: MedicalRecord) => 
        record.recordType.toLowerCase().includes("lab") ||
        record.recordType.toLowerCase().includes("test")
      );
    },
    enabled: !!user
  });

  // Filter lab results based on search query
  const filteredResults = labResults.filter((result: MedicalRecord) => 
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.recordType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active record details
  const activeRecord = activeRecordId 
    ? labResults.find((result: MedicalRecord) => result.id === activeRecordId) 
    : null;

  const getCategoryIcon = (type: string) => {
    const lowercaseType = type.toLowerCase();
    if (lowercaseType.includes("blood")) return <TestTube className="h-4 w-4" />;
    if (lowercaseType.includes("urine")) return <FlaskConical className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const isDoctor = user?.role === "doctor";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header title="Lab Results" />
        
        <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Lab Results</h1>
            
            {isDoctor && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Results
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Lab Results</DialogTitle>
                    <DialogDescription>
                      This feature is not yet implemented.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lab results..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground">Loading lab results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No lab results found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchQuery
                  ? "No lab results match your search criteria. Try a different search term."
                  : "You don't have any lab results yet."}
              </p>
              {isDoctor && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lab Results
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Lab Results</DialogTitle>
                      <DialogDescription>
                        This feature is not yet implemented.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-medium">Recent Tests</h2>
                {filteredResults.map((result: MedicalRecord) => (
                  <Card 
                    key={result.id} 
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                      activeRecordId === result.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setActiveRecordId(result.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{result.title}</CardTitle>
                          <CardDescription>{result.date}</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(result.recordType)}
                          {result.recordType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="lg:col-span-3">
                {activeRecord ? (
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{activeRecord.title}</CardTitle>
                          <CardDescription>
                            {activeRecord.date} • Ordered by Dr. {activeRecord.doctorId}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(activeRecord.recordType)}
                          {activeRecord.recordType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                        <p>{activeRecord.description}</p>
                      </div>
                      
                      <Tabs defaultValue="results">
                        <TabsList>
                          <TabsTrigger value="results">Results</TabsTrigger>
                          <TabsTrigger value="reference">Reference Values</TabsTrigger>
                          <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="results" className="space-y-4">
                          <div className="rounded-md border">
                            <div className="p-4 border-b">
                              <h4 className="font-medium">Sample Report</h4>
                            </div>
                            <div className="p-4">
                              <p className="text-muted-foreground text-sm">
                                This is a placeholder for the lab result data. In a real application, 
                                this would display the actual test results with measurements, ranges,
                                and interpretations.
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="reference" className="space-y-4">
                          <div className="rounded-md border p-4">
                            <p className="text-muted-foreground text-sm">
                              Reference values would be listed here to help interpret the test results.
                            </p>
                          </div>
                        </TabsContent>
                        <TabsContent value="notes" className="space-y-4">
                          <div className="rounded-md border p-4">
                            <p className="text-muted-foreground text-sm">
                              Doctor's notes and comments about the test results would appear here.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        Share Results
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="h-full flex flex-col justify-center items-center text-center p-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Result Selected</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Select a lab result from the list to view detailed information.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}