import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Loader2, Plus, Calendar, Clock, MapPin, Users, Search } from "lucide-react";

// Define the types for events and bookings to match the actual database schema
type EventWithCategory = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  available_seats: number;
  image_url?: string | null;
  // Changed: user_id is not in the events table, events are linked to organizers via profiles
  categories?: { name: string } | null;
  artists?: { name: string } | null;
  category_id: string | null;
  artist_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  price_start: number;
  price_end: number | null;
}

type BookingWithRelations = {
  id: string;
  event_id: string;
  user_id: string;
  seat_count: number;
  total_amount: number;
  status: string;
  created_at: string | null;
  booking_date: string | null;
  updated_at: string | null;
  events?: {
    title: string;
    event_date: string;
  } | null;
  profiles?: {
    full_name: string | null;
  } | null;
}

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if user is logged in
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  // Fetch organizer profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["organizerProfile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch organizer's events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["organizerEvents", session?.user?.id, searchQuery],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      // Define the base query
      const query = supabase
        .from("events")
        .select(`
          *,
          categories(name),
          artists(name)
        `)
        .eq("user_id", session!.user.id);
      
      // Add search filter if provided
      const filteredQuery = searchQuery 
        ? query.ilike("title", `%${searchQuery}%`) 
        : query;
      
      const { data, error } = await filteredQuery.order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as EventWithCategory[];
    },
  });
  
  // Fetch bookings for organizer's events
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["organizerBookings", session?.user?.id],
    enabled: !!session?.user?.id && events.length > 0,
    queryFn: async () => {
      const eventIds = events.map(event => event.id);
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          events(title, event_date),
          profiles(full_name)
        `)
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BookingWithRelations[];
    },
  });

  if (sessionLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-entertainment-600" />
      </div>
    );
  }

  if (!session) {
    navigate("/auth");
    return null;
  }

  if (profile && !profile.is_organizer) {
    toast.error("You don't have organizer privileges");
    navigate("/");
    return null;
  }
  
  // Calculate dashboard stats
  const upcomingEventsCount = events.filter(event => new Date(event.event_date) >= new Date()).length;
  const totalAttendeesCount = bookings.reduce((sum, booking) => sum + booking.seat_count, 0);
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Organizer Dashboard</h1>
            {profile && (
              <p className="text-gray-600">
                {profile.company_name || "Your Organization"}
              </p>
            )}
          </div>
          
          <Button 
            onClick={() => navigate("/event/create")}
            className="mt-4 md:mt-0 bg-entertainment-600 hover:bg-entertainment-700"
          >
            <Plus size={18} className="mr-1" />
            Create New Event
          </Button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold">{upcomingEventsCount}</div>
                <div className="ml-2 text-sm text-gray-500">events</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold">{totalAttendeesCount}</div>
                <div className="ml-2 text-sm text-gray-500">people</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {eventsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-entertainment-600" />
                <p className="mt-2 text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <p className="text-gray-600">You haven't created any events yet.</p>
                <Button
                  onClick={() => navigate("/event/create")}
                  className="mt-4 bg-entertainment-600 hover:bg-entertainment-700"
                >
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 bg-gray-200">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-entertainment-100 text-entertainment-400">
                          <Calendar size={48} />
                        </div>
                      )}
                      {event.categories && (
                        <Badge className="absolute top-3 right-3 bg-entertainment-600">
                          {event.categories.name}
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          <span>{event.event_time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          <span className="line-clamp-1">{event.venue}, {event.city}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          <span>{event.available_seats} seats available</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-4">
                      <div className="flex justify-between w-full">
                        <Link to={`/event/${event.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        <Link to={`/event/edit/${event.id}`}>
                          <Button size="sm">Edit Event</Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bookings">
            {bookingsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-entertainment-600" />
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <p className="text-gray-600">No bookings found for your events.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Event</th>
                      <th className="px-4 py-3 text-left">Attendee</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Seats</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{booking.events?.title}</td>
                        <td className="px-4 py-3">{booking.profiles?.full_name || "Anonymous"}</td>
                        <td className="px-4 py-3">
                          {booking.events?.event_date ? 
                            new Date(booking.events.event_date).toLocaleDateString() : 
                            "N/A"}
                        </td>
                        <td className="px-4 py-3">{booking.seat_count}</td>
                        <td className="px-4 py-3">${booking.total_amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge className={
                            booking.status === "confirmed" ? "bg-green-500" : 
                            booking.status === "pending" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
