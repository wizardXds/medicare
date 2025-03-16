import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-green-50 py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
        <div className="md:w-1/2 mt-8 md:mt-0 md:pr-12">
          <h1 className="font-bold text-4xl md:text-5xl text-neutral-700 leading-tight">Your Health, Our Priority</h1>
          <p className="text-neutral-500 mt-4 text-lg md:text-xl">
            Access quality healthcare from the comfort of your home. Book appointments, consult with specialists, and manage your medical records all in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-md transition-colors">
                Get Started
              </Button>
            </Link>
            <Link href="/hospitals">
              <Button variant="outline" className="border border-primary text-primary hover:bg-primary-light hover:text-white font-medium px-6 py-3 rounded-md transition-colors">
                Find a Doctor
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Doctor with patient" 
            className="rounded-lg shadow-xl w-full"
          />
        </div>
      </div>
    </section>
  );
}
