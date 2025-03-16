import { Star, StarHalf } from "lucide-react";

interface Testimonial {
  content: string;
  author: string;
  role: string;
  rating: number;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    content: "The appointment booking process was so simple! I found a specialist and scheduled a visit in less than 5 minutes.",
    author: "James Smith",
    role: "Patient",
    rating: 5,
    initials: "JS"
  },
  {
    content: "Having all my medical records in one place has been a game-changer. I can share my history with any doctor instantly.",
    author: "Sarah Davis",
    role: "Patient",
    rating: 5,
    initials: "SD"
  },
  {
    content: "As a busy professional, the reminder notifications and easy rescheduling options have been incredibly helpful.",
    author: "Michael Johnson",
    role: "Patient",
    rating: 4.5,
    initials: "MJ"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl text-neutral-700">What Our Patients Say</h2>
          <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">
            Don't just take our word for it – hear from our satisfied patients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="text-yellow-400 flex">
          {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
          {testimonial.rating % 1 !== 0 && (
            <StarHalf className="h-4 w-4 fill-current" />
          )}
        </div>
      </div>
      <p className="text-neutral-600 italic mb-4">{testimonial.content}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center mr-3">
          <span className="text-neutral-600 font-medium">{testimonial.initials}</span>
        </div>
        <div>
          <h4 className="font-medium">{testimonial.author}</h4>
          <p className="text-sm text-neutral-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
