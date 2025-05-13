
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Ticket } from "lucide-react";
import { fetchEventById } from "@/services/eventService";
import BookingModal from "@/components/events/BookingModal";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-entertainment-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
            <p className="text-gray-600">Sorry, the event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format price display
  const formattedPrice = `$${event.price_start}${event.price_end ? ` - $${event.price_end}` : ''}`;

  // Get lowest price for booking modal
  const lowestPrice = event.price_start;

  // Format the date
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Event Hero */}
        <div className="relative">
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={event.image_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80"} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <Badge className="mb-2 bg-entertainment-500 text-white border-none">
                {event.category_name || "Event"}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <p className="text-gray-700 mb-6">{event.description}</p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-entertainment-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-entertainment-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{event.event_time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:col-span-2">
                    <MapPin className="w-5 h-5 text-entertainment-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm text-gray-600">{event.city}</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <>
                    <h3 className="text-lg font-medium mb-3">About This Event</h3>
                    <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                  </>
                )}
              </div>
              
              {/* Artist Section (if available) */}
              {event.artists && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Performers</h2>
                  <div className="space-y-4">
                    <div className="flex items-center border-b pb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                        <img 
                          src={event.artists.image_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"} 
                          alt={event.artists.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{event.artists.name}</h4>
                        <p className="text-sm text-gray-600">{event.artists.profession}</p>
                        <p className="mt-2">{event.artists.bio}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Location Map would go here in a real app */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="aspect-video bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Map will be displayed here</span>
                </div>
                <p className="mt-4 text-gray-700">
                  {event.venue}<br />
                  {event.city}
                </p>
              </div>
            </div>
            
            {/* Ticket Booking */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Book Tickets</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <h4 className="font-medium">Standard Admission</h4>
                      <p className="text-sm text-gray-600">{formattedPrice}</p>
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                      event.available_seats > 10 ? 'bg-green-100 text-green-800' :
                      event.available_seats > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.available_seats > 10 ? 'Available' :
                       event.available_seats > 0 ? `Only ${event.available_seats} left` :
                       'Sold Out'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-entertainment-600 hover:bg-entertainment-700 flex items-center justify-center"
                    onClick={() => {
                      if (event.available_seats > 0) {
                        setBookingModalOpen(true);
                      } else {
                        toast.error("Sorry, this event is sold out");
                      }
                    }}
                    disabled={event.available_seats <= 0}
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    {event.available_seats > 0 ? "Book Now" : "Sold Out"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-entertainment-600 text-entertainment-600 hover:bg-entertainment-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Contact Organizer
                  </Button>
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p>* Tickets are non-refundable</p>
                  <p>* Please arrive 15 minutes before the event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Booking Modal */}
      {event && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          eventId={event.id}
          eventTitle={event.title}
          price={lowestPrice}
          maxSeats={event.available_seats}
        />
      )}
    </div>
  );
};

export default EventDetails;
