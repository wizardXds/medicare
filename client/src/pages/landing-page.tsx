import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function LandingPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect logged in users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "patient") {
        navigate("/patient-dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-2xl cursor-pointer">
                MediCare<span className="text-green-500">+</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" label="Home" />
            <NavLink href="/hospitals" label="Find Doctors" />
            <NavLink href="/#features" label="Services" />
            <NavLink href="/#about" label="About Us" />
            <NavLink href="/#contact" label="Contact" />
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Login
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="font-medium bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                Register
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function NavLink({ href, label }: { href: string, label: string }) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <span className={`font-medium ${isActive ? "text-primary" : "text-neutral-600"} hover:text-primary transition-colors cursor-pointer`}>
        {label}
      </span>
    </Link>
  );
}
