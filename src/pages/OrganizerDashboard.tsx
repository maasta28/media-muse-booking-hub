import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, TicketCheck, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Define proper types to avoid deep instantiation
type EventType = {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  available_seats: number;
  price_start: number;
  price_end: number | null;
};

type BookingType = {
  id: string;
  user_id: string;
  event_id: string;
  seat_count: number;
  total_amount: number;
  status: string;
  booking_date: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  events?: {
    title: string;
    venue: string;
    event_date: string;
  } | null;
};

const OrganizerDashboard = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const navigate = useNavigate();

  // Fetch events created by the organizer
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["organizerEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          categories:category_id (name)
        `)
        .eq("organizer_id", user.id);

      if (error) {
        console.error("Error fetching organizer events:", error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!profile?.is_organizer,
  });

  // Fetch bookings for the organizer's events
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["organizerBookings", user?.id, events],
    queryFn: async () => {
      if (!user?.id || !events.length) return [];
      
      const eventIds = events.map(event => event.id);
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url),
          events:event_id (title, venue, event_date)
        `)
        .in("event_id", eventIds);

      if (error) {
        console.error("Error fetching bookings:", error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!profile?.is_organizer && events.length > 0,
  });

  // Calculate dashboard stats
  const dashboardStats = {
    totalEvents: events.length,
    totalBookings: bookings.length,
    totalAttendees: bookings.reduce((sum, booking) => sum + (booking.seat_count || 0), 0),
    upcomingEvents: events.filter(event => new Date(event.event_date) > new Date()).length,
  };

  // Redirect if user is not an organizer
  React.useEffect(() => {
    if (!authLoading && (!user || !profile?.is_organizer)) {
      navigate("/organizer/onboarding");
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Manage your events and bookings</p>
          </div>
          <Button 
            className="bg-entertainment-600 hover:bg-entertainment-700 flex items-center gap-2"
            onClick={() => navigate("/event/create")}
          >
            <PlusCircle size={18} />
            Create Event
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-entertainment-50 p-3 rounded-full mr-4">
                <CalendarDays className="h-6 w-6 text-entertainment-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <h3 className="text-2xl font-bold">{dashboardStats.totalEvents}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-blue-50 p-3 rounded-full mr-4">
                <TicketCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold">{dashboardStats.totalBookings}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-green-50 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                <h3 className="text-2xl font-bold">{dashboardStats.totalAttendees}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-purple-50 p-3 rounded-full mr-4">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <h3 className="text-2xl font-bold">{dashboardStats.upcomingEvents}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>Manage and track all your events</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-4">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't created any events yet</p>
                    <Button 
                      onClick={() => navigate("/event/create")}
                      className="bg-entertainment-600 hover:bg-entertainment-700"
                    >
                      Create Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Event Name</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Venue</th>
                          <th className="text-left py-3 px-4">Available Seats</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <tr key={event.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{event.title}</td>
                            <td className="py-3 px-4">
                              {new Date(event.event_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">{event.venue}</td>
                            <td className="py-3 px-4">{event.available_seats}</td>
                            <td className="py-3 px-4">
                              ${event.price_start}
                              {event.price_end && event.price_end > event.price_start
                                ? ` - $${event.price_end}`
                                : ""}
                            </td>
                            <td className="py-3 px-4">
                              <Link to={`/event/${event.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage and track bookings for your events</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-4">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings for your events yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Booking ID</th>
                          <th className="text-left py-3 px-4">Event</th>
                          <th className="text-left py-3 px-4">Customer</th>
                          <th className="text-left py-3 px-4">Seats</th>
                          <th className="text-left py-3 px-4">Total</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">{booking.id.slice(0, 8)}</td>
                            <td className="py-3 px-4 font-medium">
                              {booking.events?.title || "Unknown event"}
                            </td>
                            <td className="py-3 px-4">{booking.profiles?.full_name || "Anonymous"}</td>
                            <td className="py-3 px-4">{booking.seat_count}</td>
                            <td className="py-3 px-4">${booking.total_amount}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "confirmed" 
                                  ? "bg-green-100 text-green-800" 
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
