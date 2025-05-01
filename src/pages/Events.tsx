
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Filter, MapPin, User } from "lucide-react";
import EventCard, { EventCardProps } from "../components/ui/EventCard";

// Mock events data
const eventsData: EventCardProps[] = [
  {
    id: "1",
    title: "Live Jazz Night with The Blue Notes",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 15, 2025",
    time: "8:00 PM",
    venue: "Blue Moon Jazz Club",
    city: "New York",
    category: "Music",
    price: "$25"
  },
  {
    id: "2",
    title: "Contemporary Dance Workshop with Mia Chen",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 18, 2025",
    time: "10:00 AM",
    venue: "Urban Dance Studio",
    city: "Los Angeles",
    category: "Dance",
    price: "$40"
  },
  {
    id: "3",
    title: "Film Screening: 'Beyond the Horizon'",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 20, 2025",
    time: "7:30 PM",
    venue: "Cineplex Arts",
    city: "Chicago",
    category: "Film",
    price: "$15"
  },
  {
    id: "4",
    title: "Comedy Night: Stand-up Showcase",
    imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 22, 2025",
    time: "9:00 PM",
    venue: "Laugh Factory",
    city: "Boston",
    category: "Comedy",
    price: "$30"
  },
  {
    id: "5",
    title: "Photography Exhibition: 'Urban Perspectives'",
    imageUrl: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 25, 2025",
    time: "11:00 AM",
    venue: "Modern Gallery",
    city: "San Francisco",
    category: "Art",
    price: "$10"
  },
  {
    id: "6",
    title: "Theater Workshop: Method Acting",
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 27, 2025",
    time: "2:00 PM",
    venue: "Community Theater",
    city: "Seattle",
    category: "Theater",
    price: "$35"
  },
  {
    id: "7",
    title: "Live Music: Electronic Night",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "June 29, 2025",
    time: "10:00 PM",
    venue: "Soundwave Club",
    city: "Miami",
    category: "Music",
    price: "$20"
  },
  {
    id: "8",
    title: "Poetry Reading & Open Mic",
    imageUrl: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "July 2, 2025",
    time: "6:30 PM",
    venue: "Literary Cafe",
    city: "Portland",
    category: "Literary",
    price: "Free"
  }
];

const categories = [
  { id: "all", name: "All Categories" },
  { id: "music", name: "Music" },
  { id: "theater", name: "Theater" },
  { id: "dance", name: "Dance" },
  { id: "film", name: "Film" },
  { id: "comedy", name: "Comedy" },
  { id: "art", name: "Art" },
  { id: "literary", name: "Literary" }
];

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState(eventsData);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterEvents(searchTerm, selectedCategory);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterEvents(searchTerm, category);
  };
  
  const filterEvents = (term: string, category: string) => {
    let results = eventsData;
    
    // Filter by search term
    if (term) {
      results = results.filter(event => 
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.venue.toLowerCase().includes(term.toLowerCase()) ||
        event.city.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Filter by category
    if (category !== "all") {
      results = results.filter(event => 
        event.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    setFilteredEvents(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header */}
        <header className="bg-entertainment-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Discover Events</h1>
              <p className="text-lg opacity-90 mb-8">
                Find and book tickets for upcoming events in the entertainment industry.
                From music concerts to theater performances, art exhibitions to film screenings.
              </p>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Search events, venues, cities..."
                  className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-entertainment-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" className="bg-white text-entertainment-600 hover:bg-gray-100">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </header>
        
        {/* Category Filters */}
        <div className="bg-white border-b sticky top-16 z-30">
          <div className="container mx-auto px-4 py-4 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map(category => (
                <Badge 
                  key={category.id} 
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategory === category.id 
                      ? "bg-entertainment-600 hover:bg-entertainment-700" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold">
                  {filteredEvents.length} Events Found
                </h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </Button>
              </div>
            </div>
            
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any events matching your search criteria.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setFilteredEvents(eventsData);
                  }}
                  className="bg-entertainment-600 hover:bg-entertainment-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Button variant="outline" className="border-entertainment-600 text-entertainment-600 hover:bg-entertainment-50">
                Load More Events
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
