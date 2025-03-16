import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-700 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4">
              MediCare<span className="text-green-500">+</span>
            </h3>
            <p className="text-neutral-300 mb-4">
              Providing quality healthcare solutions for all your medical needs.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} />
              <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="/" label="Home" />
              <FooterLink href="/hospitals" label="Find Doctors" />
              <FooterLink href="/#features" label="Services" />
              <FooterLink href="/#about" label="About Us" />
              <FooterLink href="/#contact" label="Contact" />
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              <FooterLink href="/appointment-booking" label="Appointments" />
              <FooterLink href="/medical-records" label="Medical Records" />
              <FooterLink href="/prescriptions" label="Prescriptions" />
              <FooterLink href="/lab-results" label="Lab Tests" />
              <FooterLink href="/consultations" label="Telemedicine" />
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-neutral-300">123 Healthcare Blvd, Medical City, MC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-neutral-300">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-neutral-300">info@medicare-plus.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MediCare+. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <FooterLink href="/privacy" label="Privacy Policy" small />
            <FooterLink href="/terms" label="Terms of Service" small />
            <FooterLink href="/cookies" label="Cookie Policy" small />
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="text-white hover:text-blue-400 transition-colors"
      target="_blank" 
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <li>
      <Link href={href}>
        <span className={`${small ? 'text-sm' : ''} text-neutral-300 hover:text-white transition-colors cursor-pointer`}>
          {label}
        </span>
      </Link>
    </li>
  );
}
