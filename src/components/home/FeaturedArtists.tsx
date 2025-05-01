
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ArtistCard, { ArtistCardProps } from "../ui/ArtistCard";
import { Link } from "react-router-dom";

// Mock data for featured artists
const featuredArtists: ArtistCardProps[] = [
  {
    id: "1",
    name: "Sophia Rodriguez",
    profession: "Actress & Voice Artist",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    categories: ["Acting", "Voice Over", "Theater"]
  },
  {
    id: "2",
    name: "James Wilson",
    profession: "Music Producer & DJ",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    categories: ["Electronic", "Hip Hop", "Production"]
  },
  {
    id: "3",
    name: "Mia Chen",
    profession: "Dancer & Choreographer",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    categories: ["Contemporary", "Hip Hop", "Ballet"]
  },
  {
    id: "4",
    name: "David Thompson",
    profession: "Director & Filmmaker",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    categories: ["Film", "Documentary", "Music Videos"]
  }
];

const FeaturedArtists = () => {
  const [activeTab, setActiveTab] = useState<string>("trending");
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Featured Artists</h2>
            <p className="text-gray-600 max-w-2xl">
              Discover talented artists from across the entertainment industry. 
              Browse portfolios, view upcoming shows, and book your next experience.
            </p>
          </div>
          
          <div className="flex space-x-2 mt-6 md:mt-0">
            <Button 
              variant={activeTab === "trending" ? "default" : "outline"}
              onClick={() => setActiveTab("trending")}
              className={activeTab === "trending" ? "bg-entertainment-600 hover:bg-entertainment-700" : ""}
            >
              Trending
            </Button>
            <Button 
              variant={activeTab === "new" ? "default" : "outline"}
              onClick={() => setActiveTab("new")}
              className={activeTab === "new" ? "bg-entertainment-600 hover:bg-entertainment-700" : ""}
            >
              New Talent
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {featuredArtists.map((artist) => (
            <ArtistCard key={artist.id} {...artist} />
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="border-entertainment-600 text-entertainment-600 hover:bg-entertainment-50">
            <Link to="/artists">View All Artists</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
