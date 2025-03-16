import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Prescription } from "@shared/schema";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  AlertCircle,
  Calendar,
  Clock,
  FilePenLine,
  MoreHorizontal,
  Plus,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Prescriptions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [openSidebar, setOpenSidebar] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    setOpenSidebar(!isMobile);
  }, [isMobile]);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["/api/prescriptions", user?.id],
    queryFn: async () => {
      const role = user?.role;
      const id = user?.id;
      
      if (!id) return [];

      const queryParam = role === "doctor" ? `doctorId=${id}` : `patientId=${id}`;
      const response = await fetch(`/api/prescriptions?${queryParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
      
      return response.json();
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'expired':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription: Prescription) => {
    if (activeTab === "all") return true;
    return prescription.status.toLowerCase() === activeTab.toLowerCase();
  });

  const isDoctor = user?.role === "doctor";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header title="Prescriptions" />
        
        <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">My Prescriptions</h1>
            
            {isDoctor && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Prescription</DialogTitle>
                    <DialogDescription>
                      This feature is not yet implemented.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Loading prescriptions...</p>
                </div>
              ) : filteredPrescriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrescriptions.map((prescription: Prescription) => (
                    <Card key={prescription.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{prescription.medicationName}</CardTitle>
                            <CardDescription>
                              {prescription.dosage} - {prescription.frequency}
                            </CardDescription>
                          </div>
                          
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {prescription.startDate} 
                              {prescription.endDate && ` to ${prescription.endDate}`}
                            </span>
                          </div>
                          
                          {prescription.instructions && (
                            <div className="flex items-start gap-3 pt-1">
                              <FilePenLine className="h-4 w-4 text-muted-foreground mt-1" />
                              <span className="text-sm">{prescription.instructions}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="pt-3 flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Prescribed on {new Date(prescription.createdAt).toLocaleDateString()}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Print Prescription</DropdownMenuItem>
                            {isDoctor && prescription.status === "active" && (
                              <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center rounded-lg border border-dashed">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No prescriptions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "active" 
                      ? "You don't have any active prescriptions." 
                      : `No ${activeTab} prescriptions available.`}
                  </p>
                  {isDoctor && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create New Prescription
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Prescription</DialogTitle>
                          <DialogDescription>
                            This feature is not yet implemented.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}