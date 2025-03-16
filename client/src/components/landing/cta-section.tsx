import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CTASection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-bold text-3xl text-white mb-6">
          Ready to take control of your healthcare?
        </h2>
        <p className="text-white opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of patients who have simplified their healthcare journey with MediCare+.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/auth">
            <Button className="bg-white text-primary hover:bg-neutral-100 font-medium px-6 py-3 rounded-md transition-colors">
              Create an Account
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="border border-white text-white hover:bg-primary-dark font-medium px-6 py-3 rounded-md transition-colors">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
