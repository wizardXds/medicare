import { Link, useLocation } from "wouter";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-primary font-bold text-2xl mr-8">
              MediCare<span className="text-green-500">+</span>
            </a>
          </Link>
          <nav className="hidden md:flex space-x-6">
            {user?.role === "patient" && (
              <>
                <NavLink href="/patient-dashboard" label="Dashboard" />
                <NavLink href="/appointment-booking" label="Appointments" />
                <NavLink href="/medical-records" label="Medical Records" />
                <NavLink href="/hospitals" label="Find Doctors" />
              </>
            )}
            {user?.role === "doctor" && (
              <>
                <NavLink href="/doctor-dashboard" label="Dashboard" />
                <NavLink href="/appointment-booking" label="Appointments" />
                <NavLink href="/medical-records" label="Patient Records" />
              </>
            )}
            {user?.role === "admin" && (
              <>
                <NavLink href="/admin-dashboard" label="Dashboard" />
                <NavLink href="/admin-dashboard/users" label="Users" />
                <NavLink href="/admin-dashboard/hospitals" label="Hospitals" />
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.firstName} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-neutral-700 mr-1 hidden sm:inline-block">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="w-full cursor-pointer">Profile Settings</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string, label: string }) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a className={`font-medium ${isActive 
        ? "text-primary border-b-2 border-primary px-1" 
        : "text-neutral-600 hover:text-primary transition-colors px-1"}`}>
        {label}
      </a>
    </Link>
  );
}
