
import { Button } from "@/components/ui/button";
import EventCard, { EventCardProps } from "../ui/EventCard";
import { Link } from "react-router-dom";

// Mock data for upcoming shows/events
const upcomingEvents: EventCardProps[] = [
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
  }
];

const UpcomingShows = () => {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
        
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
