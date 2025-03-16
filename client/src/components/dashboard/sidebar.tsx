import React from 'react';
import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  FileText, 
  Home, 
  MessageSquare, 
  Pill, 
  Settings, 
  TestTube, 
  User, 
  Users, 
  CreditCard,
  UserCog,
  LogOut,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };
  
  return (
    <aside className="bg-white shadow-md h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar>
            <AvatarImage src="" alt={user?.firstName} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-neutral-700">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-neutral-500">
              {user?.role === "patient" ? "Patient" : user?.role === "doctor" ? "Doctor" : "Admin"}
            </p>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {user?.role === "patient" && <PatientNavItems />}
            {user?.role === "doctor" && <DoctorNavItems />}
            {user?.role === "admin" && <AdminNavItems />}
            
            <li className="pt-4 mt-4 border-t border-neutral-200">
              <NavItem href="/settings" icon={<Settings />} label="Settings" />
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full space-x-3 text-neutral-600 hover:text-primary hover:bg-primary-light hover:bg-opacity-10 rounded-md px-4 py-2 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function PatientNavItems() {
  return (
    <>
      <li>
        <NavItem href="/patient-dashboard" icon={<Home />} label="Dashboard" />
      </li>
      <li>
        <NavItem href="/appointment-booking" icon={<Calendar />} label="Appointments" />
      </li>
      <li>
        <NavItem href="/medical-records" icon={<FileText />} label="Medical Records" />
      </li>
      <li>
        <NavItem href="/prescriptions" icon={<Pill />} label="Prescriptions" />
      </li>
      <li>
        <NavItem href="/lab-results" icon={<TestTube />} label="Lab Results" />
      </li>
      <li>
        <NavItem href="/hospitals" icon={<User />} label="Find Doctors" badge={0} />
      </li>
      <li>
        <NavItem href="/messages" icon={<MessageSquare />} label="Messages" badge={2} />
      </li>
      <li>
        <NavItem href="/payments" icon={<CreditCard />} label="Payments" />
      </li>
    </>
  );
}

function DoctorNavItems() {
  return (
    <>
      <li>
        <NavItem href="/doctor-dashboard" icon={<Home />} label="Dashboard" />
      </li>
      <li>
        <NavItem href="/appointment-booking" icon={<Calendar />} label="Appointments" />
      </li>
      <li>
        <NavItem href="/patients" icon={<Users />} label="My Patients" />
      </li>
      <li>
        <NavItem href="/medical-records" icon={<FileText />} label="Patient Records" />
      </li>
      <li>
        <NavItem href="/prescriptions" icon={<Pill />} label="Prescriptions" />
      </li>
      <li>
        <NavItem href="/messages" icon={<MessageSquare />} label="Messages" badge={2} />
      </li>
      <li>
        <NavItem href="/schedule" icon={<Calendar />} label="My Schedule" />
      </li>
    </>
  );
}

function AdminNavItems() {
  return (
    <>
      <li>
        <NavItem href="/admin-dashboard" icon={<Home />} label="Dashboard" />
      </li>
      <li>
        <NavItem href="/admin-dashboard/users" icon={<Users />} label="Users Management" />
      </li>
      <li>
        <NavItem href="/admin-dashboard/doctors" icon={<UserCog />} label="Doctors" />
      </li>
      <li>
        <NavItem href="/admin-dashboard/hospitals" icon={<Building2 />} label="Hospitals" />
      </li>
      <li>
        <NavItem href="/admin-dashboard/appointments" icon={<Calendar />} label="Appointments" />
      </li>
      <li>
        <NavItem href="/admin-dashboard/payments" icon={<CreditCard />} label="Payments" />
      </li>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ href, icon, label, badge }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a
        className={`flex items-center space-x-3 rounded-md px-4 py-2 transition-colors ${
          isActive
            ? "text-primary bg-primary-light bg-opacity-10"
            : "text-neutral-600 hover:text-primary hover:bg-primary-light hover:bg-opacity-10"
        }`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-5 w-5",
        })}
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
}
