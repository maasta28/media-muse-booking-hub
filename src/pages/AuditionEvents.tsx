
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import EventCard, { EventCardProps } from "../components/ui/EventCard";
import { fetchEvents, EventWithCategory } from "@/services/eventService";
import { supabase } from "@/integrations/supabase/client";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AuditionEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  // Fetch audition events from Supabase
  const { 
    data: eventsData = [], 
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents 
  } = useQuery({
    queryKey: ['auditionEvents'],
    queryFn: async () => {
      try {
        // Get the category ID for "Audition" category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'Audition')
          .single();

        if (categoryError) {
          console.error("Error fetching audition category:", categoryError);
          return [];
        }

        if (!categoryData) {
          return [];
        }

        // Now fetch all events with the audition category
        return fetchEvents({ category: "Audition" });
      } catch (error) {
        console.error("Error fetching audition events:", error);
        return [];
      }
    }
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchEvents();
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
      category: "Audition",
      price: price,
      availableSeats: event.available_seats
    };
  };

  // Show error toast if fetch fails
  useEffect(() => {
    if (eventsError) {
      toast.error("Failed to load audition events. Please try again later.");
    }
  }, [eventsError]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header */}
        <header className="bg-entertainment-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Audition Opportunities</h1>
              <p className="text-lg opacity-90 mb-8">
                Find casting calls, auditions, and opportunities to showcase your talent.
                Apply to roles in theater, film, music, and more.
              </p>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Search auditions, roles, locations..."
                  className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-entertainment-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" className="bg-white text-entertainment-700 hover:bg-gray-100">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </header>
        
        {/* Events Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">
                {eventsLoading 
                  ? "Loading auditions..." 
                  : `${filteredEvents.length} Audition ${filteredEvents.length === 1 ? 'Opportunity' : 'Opportunities'} Found`}
              </h2>
              <p className="text-gray-600 mt-2">
                Apply to these opportunities to showcase your talent and advance your career
              </p>
            </div>
            
            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
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
                <h3 className="text-xl font-medium mb-2">No Auditions Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any audition events matching your search criteria.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
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

export default AuditionEvents;
