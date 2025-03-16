import { CalendarCheck, FileText, Users } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <CalendarCheck className="text-white" />,
    title: "Easy Appointments",
    description: "Schedule appointments with specialists in just a few clicks. No more waiting in lines or on hold."
  },
  {
    icon: <FileText className="text-white" />,
    title: "Medical Records",
    description: "Access your medical history, test results, and prescriptions securely anytime, anywhere."
  },
  {
    icon: <Users className="text-white" />,
    title: "Top Specialists",
    description: "Connect with a network of verified healthcare professionals across various specialties."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl text-neutral-700">Why Choose MediCare+</h2>
          <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">
            Our platform offers a comprehensive suite of healthcare services designed to make your experience seamless and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              colorIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorIndex: number;
}

function FeatureCard({ icon, title, description, colorIndex }: FeatureCardProps) {
  // Array of background colors for the icon circles
  const bgColors = [
    "bg-blue-400", // For Easy Appointments
    "bg-green-400", // For Medical Records
    "bg-orange-400", // For Top Specialists
  ];
  
  return (
    <div className="bg-neutral-100 p-6 rounded-lg transition-transform hover:scale-105">
      <div className={`w-12 h-12 ${bgColors[colorIndex]} rounded-full flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-neutral-500">{description}</p>
    </div>
  );
}
