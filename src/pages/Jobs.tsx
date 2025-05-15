
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Briefcase } from "lucide-react";

const Jobs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <Briefcase size={48} className="mx-auto mb-4 text-entertainment-500" />
            <h1 className="text-3xl font-bold mb-4">Jobs Marketplace</h1>
            <p className="text-lg text-gray-600 mb-8">
              Find job opportunities in the media and entertainment industry.
              Coming soon!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
