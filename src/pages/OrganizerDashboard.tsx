
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Loader2, Plus, Calendar, Clock, MapPin, Users, Search } from "lucide-react";

// Simplified types to prevent deep nesting issues
type SimpleEventData = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  available_seats: number;
  image_url?: string | null;
  category_id: string | null;
  artist_id: string | null;
  price_start: number;
  price_end: number | null;
  category_name?: string | null;
  artist_name?: string | null;
};

// Simplified type for bookings
type SimpleBookingData = {
  id: string;
  event_id: string;
  user_id: string;
  seat_count: number;
  total_amount: number;
  status: string;
  created_at: string | null;
  booking_date: string | null;
  event_title?: string | null;
  event_date?: string | null;
  attendee_name?: string | null;
};

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
  
  // Fetch organizer's events with simplified approach to prevent deep types
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["organizerEvents", session?.user?.id, searchQuery],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        // First, fetch basic event data
        let query = supabase
          .from("events")
          .select(`
            id, title, description, event_date, event_time, venue, city,
            available_seats, image_url, category_id, artist_id,
            created_at, updated_at, price_start, price_end
          `)
          .eq("user_id", session.user.id);
        
        // Apply search filter if provided
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }
        
        const { data: eventsData, error } = await query.order("event_date", { ascending: true });
        
        if (error) throw error;
        
        if (!eventsData || eventsData.length === 0) return [];
        
        // Now enhance events with category and artist names separately
        const enhancedEvents: SimpleEventData[] = [];
        
        for (const event of eventsData) {
          // Create base event with type safety
          const enhancedEvent: SimpleEventData = {
            id: event.id,
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            event_time: event.event_time,
            venue: event.venue,
            city: event.city,
            available_seats: event.available_seats,
            image_url: event.image_url,
            category_id: event.category_id,
            artist_id: event.artist_id,
            price_start: event.price_start,
            price_end: event.price_end,
            category_name: null,
            artist_name: null,
          };
          
          // Get category name if category_id exists
          if (enhancedEvent.category_id) {
            const { data: categoryData } = await supabase
              .from("categories")
              .select("name")
              .eq("id", enhancedEvent.category_id)
              .single();
            
            enhancedEvent.category_name = categoryData?.name || null;
          }
          
          // Get artist name if artist_id exists
          if (enhancedEvent.artist_id) {
            const { data: artistData } = await supabase
              .from("artists")
              .select("name")
              .eq("id", enhancedEvent.artist_id)
              .single();
            
            enhancedEvent.artist_name = artistData?.name || null;
          }
          
          enhancedEvents.push(enhancedEvent);
        }
        
        return enhancedEvents;
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    },
  });
  
  // Fetch bookings for organizer's events
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["organizerBookings", session?.user?.id, events.map(e => e.id).join()],
    enabled: !!session?.user?.id && events.length > 0,
    queryFn: async () => {
      if (!events.length) return [];
      
      try {
        const eventIds = events.map(event => event.id);
        
        // Fetch basic booking data
        const { data: bookingsData, error } = await supabase
          .from("bookings")
          .select("id, event_id, user_id, seat_count, total_amount, status, created_at, booking_date")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        if (!bookingsData || bookingsData.length === 0) return [];
        
        // Enhance booking data with related information
        const enhancedBookings: SimpleBookingData[] = [];
        
        for (const booking of bookingsData) {
          // Initialize the enhanced booking with known data
          const enhancedBooking: SimpleBookingData = {
            id: booking.id,
            event_id: booking.event_id,
            user_id: booking.user_id,
            seat_count: booking.seat_count,
            total_amount: booking.total_amount,
            status: booking.status,
            created_at: booking.created_at,
            booking_date: booking.booking_date,
            event_title: null,
            event_date: null,
            attendee_name: null,
          };
          
          // Get event details
          const { data: eventData } = await supabase
            .from("events")
            .select("title, event_date")
            .eq("id", booking.event_id)
            .single();
          
          if (eventData) {
            enhancedBooking.event_title = eventData.title;
            enhancedBooking.event_date = eventData.event_date;
          }
          
          // Get user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", booking.user_id)
            .single();
          
          if (profileData) {
            enhancedBooking.attendee_name = profileData.full_name;
          }
          
          enhancedBookings.push(enhancedBooking);
        }
        
        return enhancedBookings;
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }
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
                      {event.category_name && (
                        <Badge className="absolute top-3 right-3 bg-entertainment-600">
                          {event.category_name}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.event_title || "Unknown Event"}</TableCell>
                        <TableCell>{booking.attendee_name || "Anonymous"}</TableCell>
                        <TableCell>
                          {booking.event_date ? 
                            new Date(booking.event_date).toLocaleDateString() : 
                            "N/A"}
                        </TableCell>
                        <TableCell>{booking.seat_count}</TableCell>
                        <TableCell>${booking.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={
                            booking.status === "confirmed" ? "bg-green-500" : 
                            booking.status === "pending" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
