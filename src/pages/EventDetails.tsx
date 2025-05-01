
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Ticket } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Mock event data - in a real app this would come from an API
  const event = {
    id: id || "1",
    title: "Live Jazz Night with The Blue Notes",
    description: "Experience an unforgettable evening of soulful jazz with The Blue Notes. This acclaimed quartet brings their unique blend of classic jazz standards and original compositions to the Blue Moon Jazz Club for a one-night-only performance. Perfect for jazz aficionados and newcomers alike, the night promises smooth rhythms, improvised solos, and an intimate atmosphere.",
    longDescription: "The Blue Notes have been captivating audiences across the country with their unique sound that blends traditional jazz with contemporary influences. The quartet features James Wilson on piano, Eliza Chen on saxophone, Marcus Johnson on bass, and David Rodriguez on drums. Each musician brings years of experience and a distinctive style to create a cohesive and engaging performance.\n\nThe evening's repertoire will include beloved jazz standards, innovative reinterpretations of modern songs, and original compositions from their latest album 'Midnight Harmony', which has received critical acclaim in the jazz community.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
    date: "June 15, 2025",
    time: "8:00 PM - 10:30 PM",
    venue: "Blue Moon Jazz Club",
    address: "123 Music Avenue",
    city: "New York",
    zipCode: "10001",
    category: "Music",
    subCategory: "Jazz",
    price: "$25",
    ticketOptions: [
      { id: "t1", name: "General Admission", price: "$25", available: true },
      { id: "t2", name: "VIP (includes meet & greet)", price: "$45", available: true },
      { id: "t3", name: "Group (4+ people)", price: "$20 per person", available: true }
    ],
    performers: [
      {
        id: "p1",
        name: "James Wilson",
        role: "Piano",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "p2",
        name: "Eliza Chen",
        role: "Saxophone",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Event Hero */}
        <div className="relative">
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <Badge className="mb-2 bg-entertainment-500 text-white border-none">
                {event.category} - {event.subCategory}
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
                      <p className="font-medium">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-entertainment-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:col-span-2">
                    <MapPin className="w-5 h-5 text-entertainment-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm text-gray-600">{event.address}, {event.city}, {event.zipCode}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-3">About This Event</h3>
                <p className="text-gray-700 whitespace-pre-line">{event.longDescription}</p>
              </div>
              
              {/* Performers */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Performers</h2>
                <div className="space-y-4">
                  {event.performers.map(performer => (
                    <div key={performer.id} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={performer.imageUrl} 
                          alt={performer.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{performer.name}</h4>
                        <p className="text-sm text-gray-600">{performer.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location Map would go here in a real app */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="aspect-video bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Map will be displayed here</span>
                </div>
                <p className="mt-4 text-gray-700">
                  {event.venue}<br />
                  {event.address}<br />
                  {event.city}, {event.zipCode}
                </p>
              </div>
            </div>
            
            {/* Ticket Booking */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Book Tickets</h2>
                <div className="space-y-4 mb-6">
                  {event.ticketOptions.map(option => (
                    <div key={option.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-gray-600">{option.price}</p>
                      </div>
                      <div>
                        <Button 
                          size="sm" 
                          className="bg-entertainment-600 hover:bg-entertainment-700"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-entertainment-600 hover:bg-entertainment-700 flex items-center justify-center"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Book Now
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
    </div>
  );
};

export default EventDetails;
