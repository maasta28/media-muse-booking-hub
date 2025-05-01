
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Filter, MapPin, User } from "lucide-react";
import EventCard, { EventCardProps } from "../components/ui/EventCard";
import { fetchEvents, fetchCategories, EventWithCategory } from "@/services/eventService";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  // Fetch events from Supabase
  const { 
    data: eventsData = [], 
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents 
  } = useQuery({
    queryKey: ['events', selectedCategory, currentPage],
    queryFn: () => fetchEvents({ 
      category: selectedCategory !== 'all' ? selectedCategory : undefined 
    })
  });

  // Fetch categories from Supabase
  const { 
    data: categoriesData = [],
    isLoading: categoriesLoading,
    isError: categoriesError 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchEvents();
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Local state for filtered events (search is handled locally after data is fetched)
  const [filteredEvents, setFilteredEvents] = useState<EventWithCategory[]>([]);

  // Filter events when data or search term changes
  useEffect(() => {
    if (eventsData.length > 0) {
      let results = [...eventsData];
      
      // Apply search filter locally
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(event => 
          event.title.toLowerCase().includes(term) ||
          event.venue.toLowerCase().includes(term) ||
          event.city.toLowerCase().includes(term)
        );
      }
      
      setFilteredEvents(results);
    } else {
      setFilteredEvents([]);
    }
  }, [eventsData, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  // Map database events to EventCard props
  const mapEventToProps = (event: EventWithCategory): EventCardProps => {
    // Format the date
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Format the price
    let price = `$${event.price_start}`;
    if (event.price_end && event.price_end > event.price_start) {
      price = `$${event.price_start} - $${event.price_end}`;
    }

    return {
      id: event.id,
      title: event.title,
      imageUrl: event.image_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      date: formattedDate,
      time: event.event_time,
      venue: event.venue,
      city: event.city,
      category: event.category_name || "Event",
      price: price
    };
  };

  // Show error toast if fetch fails
  useEffect(() => {
    if (eventsError) {
      toast.error("Failed to load events. Please try again later.");
    }
    if (categoriesError) {
      toast.error("Failed to load categories. Please try again later.");
    }
  }, [eventsError, categoriesError]);

  // Prepare categories for display
  const categories = [
    { id: "all", name: "All Categories" },
    ...(categoriesData?.map(cat => ({ id: cat.name, name: cat.name })) || [])
  ];

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
              {!categoriesLoading && categories.map(category => (
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
              
              {categoriesLoading && (
                Array(7).fill(0).map((_, i) => (
                  <div key={i} className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold">
                  {eventsLoading 
                    ? "Loading events..." 
                    : `${filteredEvents.length} Events Found`}
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
            
            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm h-96 animate-pulse"></div>
                ))}
              </div>
            ) : paginatedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {paginatedEvents.map((event) => (
                  <EventCard key={event.id} {...mapEventToProps(event)} />
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
                    refetchEvents();
                  }}
                  className="bg-entertainment-600 hover:bg-entertainment-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
