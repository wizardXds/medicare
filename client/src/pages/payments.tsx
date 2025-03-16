import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Payment, Appointment } from "@shared/schema";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  CreditCard,
  Download,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Payments() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [openSidebar, setOpenSidebar] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setOpenSidebar(!isMobile);
  }, [isMobile]);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/payments?patientId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      
      return response.json();
    },
    enabled: !!user
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const queryParam = user.role === "doctor" 
        ? `doctorId=${user.id}` 
        : `patientId=${user.id}`;
      
      const response = await fetch(`/api/appointments?${queryParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      
      return response.json();
    },
    enabled: !!user
  });

  // Filter payments based on status and search query
  const filteredPayments = payments.filter((payment: Payment) => {
    const matchesStatus = activeTab === "all" || payment.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         payment.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && (searchQuery === "" || matchesSearch);
  });

  // Get payment statistics
  const totalPaid = payments
    .filter((payment: Payment) => payment.status === "completed")
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
  
  const pendingAmount = payments
    .filter((payment: Payment) => payment.status === "pending")
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

  const totalBilled = payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

  // Get appointment details for payment
  const getAppointmentDetails = (appointmentId: number) => {
    return appointments.find((appt: Appointment) => appt.id === appointmentId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header title="Payments" />
        
        <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Payments & Billing</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Make a Payment</DialogTitle>
                  <DialogDescription>
                    This feature is not yet implemented.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Billed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBilled)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-medium">Payment History</h2>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search payments..."
                      className="pl-9 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select defaultValue="all" onValueChange={setActiveTab}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No payments found</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {searchQuery
                    ? "No payments match your search criteria. Try a different search term."
                    : activeTab !== "all"
                    ? `You don't have any ${activeTab} payments.`
                    : "You haven't made any payments yet."}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Make a Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make a Payment</DialogTitle>
                      <DialogDescription>
                        This feature is not yet implemented.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Method</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment: Payment) => {
                      const appointment = getAppointmentDetails(payment.appointmentId);
                      return (
                        <tr key={payment.id} className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {appointment ? (
                              <div>
                                <div className="font-medium">Appointment</div>
                                <div className="text-sm text-muted-foreground">
                                  {appointment.date} at {appointment.time}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">Medical Service</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {payment.appointmentId}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3 px-4">
                            {payment.paymentMethod || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="icon" variant="ghost">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-muted-foreground">
                      Visa ending in 4242
                    </div>
                  </div>
                  <div>
                    <Badge>Default</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}