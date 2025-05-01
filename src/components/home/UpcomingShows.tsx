
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import EventCard, { EventCardProps } from "../ui/EventCard";
import { Link } from "react-router-dom";
import { fetchEvents, EventWithCategory } from "@/services/eventService";

const UpcomingShows = () => {
  // Fetch events from Supabase
  const { data: eventsData = [], isLoading, isError } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => fetchEvents({ }),
    select: (data) => data.slice(0, 4), // Only show the first 4 events
  });

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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold mb-4">Upcoming Shows & Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover exciting performances, workshops, and events from talented artists.
            Book your tickets today and experience unforgettable entertainment.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm h-80 animate-pulse"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Failed to load upcoming events. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {eventsData.map((event) => (
              <EventCard key={event.id} {...mapEventToProps(event)} />
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Button asChild className="bg-entertainment-600 hover:bg-entertainment-700">
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingShows;
