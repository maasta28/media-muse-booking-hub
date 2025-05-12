
import { File, Image, Video, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PortfolioFeature = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Your Professional Portfolio</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Showcase your work, experience, and talent to casting directors, event organizers, and industry professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side: Image/mockup */}
          <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-gray-50 p-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Portfolio Demo"
              className="w-full"
            />
          </div>

          {/* Right side: Features */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Your Digital Identity in Media & Entertainment</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-entertainment-100 p-3 rounded-full mr-4">
                  <Image className="w-6 h-6 text-entertainment-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Showcase Your Work</h4>
                  <p className="text-gray-600 mt-1">Upload photos, videos, and links to showcase your projects and performances.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-entertainment-100 p-3 rounded-full mr-4">
                  <File className="w-6 h-6 text-entertainment-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Organize by Projects</h4>
                  <p className="text-gray-600 mt-1">List all your projects with detailed information about your role and contribution.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-entertainment-100 p-3 rounded-full mr-4">
                  <LinkIcon className="w-6 h-6 text-entertainment-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Share with Anyone</h4>
                  <p className="text-gray-600 mt-1">Get a personalized link to share your portfolio with casting directors and producers.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-entertainment-100 p-3 rounded-full mr-4">
                  <Video className="w-6 h-6 text-entertainment-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Embed Media</h4>
                  <p className="text-gray-600 mt-1">Integrate videos from YouTube, Vimeo, and other platforms directly into your portfolio.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button asChild className="bg-entertainment-600 hover:bg-entertainment-700">
                <Link to="/artist/create">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="pt-10 border-t">
          <h3 className="text-2xl font-semibold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-entertainment-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-entertainment-600">1</span>
              </div>
              <h4 className="font-medium mb-2">Sign Up</h4>
              <p className="text-gray-600 text-sm">Create an account or log in to get started.</p>
            </div>

            <div className="text-center">
              <div className="bg-entertainment-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-entertainment-600">2</span>
              </div>
              <h4 className="font-medium mb-2">Build Profile</h4>
              <p className="text-gray-600 text-sm">Add your bio, profession, and other details.</p>
            </div>

            <div className="text-center">
              <div className="bg-entertainment-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-entertainment-600">3</span>
              </div>
              <h4 className="font-medium mb-2">Add Projects</h4>
              <p className="text-gray-600 text-sm">Upload your work and showcase your talent.</p>
            </div>

            <div className="text-center">
              <div className="bg-entertainment-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-entertainment-600">4</span>
              </div>
              <h4 className="font-medium mb-2">Share</h4>
              <p className="text-gray-600 text-sm">Share your portfolio with anyone in the industry.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioFeature;
