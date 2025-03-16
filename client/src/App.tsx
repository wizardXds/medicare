import { AuthProvider } from "./hooks/use-auth";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AppointmentBooking from "@/pages/appointment-booking";
import MedicalRecords from "@/pages/medical-records";
import SettingsPage from "@/pages/settings-page";
import HospitalSearch from "@/pages/hospital-search";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/patient-dashboard" component={PatientDashboard} />
      <ProtectedRoute path="/doctor-dashboard" component={DoctorDashboard} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/appointment-booking" component={AppointmentBooking} />
      <ProtectedRoute path="/medical-records" component={MedicalRecords} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/hospitals" component={HospitalSearch} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
