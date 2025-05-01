
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Clock, MapPin, Image, Video, Ticket } from "lucide-react";

const ArtistPortfolio = () => {
  const { id } = useParams<{ id: string }>();

  // Mock artist data - in a real app this would come from an API
  const artist = {
    id: id || "1",
    name: "Sophia Rodriguez",
    profession: "Actress & Voice Artist",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
    bio: "Sophia Rodriguez is a versatile actress and voice artist with over 8 years of professional experience across theater, film, and voice acting. She has performed in major theatrical productions and has lent her voice to animated series and commercials.",
    location: "New York, NY",
    rating: 4.8,
    reviews: 124,
    followers: 3245,
    categories: ["Acting", "Voice Over", "Theater", "Film"],
    skills: ["Method Acting", "Improv", "Character Voices", "Dialect Coach", "Screenwriting"],
    portfolio: [
      {
        id: "p1",
        title: "Hamlet - Lead Role",
        type: "Theater",
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Lead role in Shakespeare's Hamlet at the Metropolitan Theater."
      },
      {
        id: "p2",
        title: "Voice of 'Luna' in Moonlight Tales",
        type: "Voice Acting",
        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Main character voice in the animated series 'Moonlight Tales'."
      },
      {
        id: "p3",
        title: "Short Film: 'Beyond'",
        type: "Film",
        imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Lead actress in award-winning short film 'Beyond'."
      },
      {
        id: "p4",
        title: "Commercial: EcoBrand",
        type: "Commercial",
        imageUrl: "https://images.unsplash.com/photo-1559223607-a43f990c095d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Featured in national television commercial for EcoBrand."
      }
    ],
    upcomingEvents: [
      {
        id: "e1",
        title: "A Midsummer Night's Dream",
        date: "June 25, 2025",
        time: "7:30 PM",
        venue: "Central Park Theater",
        city: "New York",
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "$35"
      },
      {
        id: "e2",
        title: "Voice Acting Workshop",
        date: "July 3, 2025",
        time: "10:00 AM",
        venue: "Creative Studio",
        city: "New York",
        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "$75"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={artist.coverUrl} 
            alt={`${artist.name} cover`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row">
              {/* Profile Image */}
              <div className="md:mr-8 mb-4 md:mb-0 flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img 
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{artist.name}</h1>
                    <p className="text-gray-600 text-lg mb-2">{artist.profession}</p>
                    
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{artist.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="bg-entertainment-100 text-entertainment-700">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-4 md:mt-0 space-y-2">
                    <Button className="bg-entertainment-600 hover:bg-entertainment-700">
                      Book Now
                    </Button>
                    <Button variant="outline" className="border-entertainment-600 text-entertainment-600 hover:bg-entertainment-50">
                      Contact Artist
                    </Button>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center">
                    <div className="flex mr-1">
                      {Array(5).fill(0).map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(artist.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium">{artist.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({artist.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium">{artist.followers.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-1">followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Content */}
          <Tabs defaultValue="about" className="mb-12">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Biography</h2>
                <p className="text-gray-700 mb-8">{artist.bio}</p>
                
                <h3 className="text-lg font-semibold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {artist.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-gray-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Contact for Bookings</h3>
                <p className="text-gray-700">
                  Interested in booking {artist.name.split(" ")[0]} for your event? 
                  Use the booking button above or contact through the platform messaging system.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Portfolio</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      <span>Photos</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span>Videos</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artist.portfolio.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <Badge className="self-start mb-2 bg-entertainment-500 text-white">
                          {item.type}
                        </Badge>
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <p className="text-white/80 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
                
                <div className="space-y-6">
                  {artist.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-b-0">
                      <div className="md:w-1/4 aspect-video overflow-hidden rounded-lg shadow-md">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-1/2">
                        <h3 className="text-lg font-medium mb-2">{event.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-entertainment-500" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-entertainment-500" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-entertainment-500" />
                            <span>{event.venue}, {event.city}</span>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-1/4 flex flex-col justify-between items-start md:items-end mt-4 md:mt-0">
                        <div className="text-entertainment-600 font-semibold text-lg">
                          {event.price}
                        </div>
                        <Button className="bg-entertainment-600 hover:bg-entertainment-700 w-full md:w-auto mt-4 md:mt-0">
                          <Ticket className="w-4 h-4 mr-2" />
                          Book Tickets
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {artist.upcomingEvents.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming events scheduled at the moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Reviews</h2>
                
                {/* This would be populated with actual reviews in a real app */}
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Reviewer" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">Emily Johnson</div>
                        <div className="text-sm text-gray-500">June 10, 2025</div>
                      </div>
                      <div className="ml-auto flex">
                        {Array(5).fill(0).map((_, i) => (
                          <svg 
                            key={i} 
                            className="w-4 h-4 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">
                      "Sophia was incredible in the production of Hamlet. Her portrayal of Ophelia was moving and captivating. 
                      One of the best performances I've seen this year!"
                    </p>
                  </div>
                  
                  <div className="border-b pb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Reviewer" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">Robert Chen</div>
                        <div className="text-sm text-gray-500">May 25, 2025</div>
                      </div>
                      <div className="ml-auto flex">
                        {Array(5).fill(0).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">
                      "I attended Sophia's voice acting workshop and learned so much in just a few hours. 
                      Her expertise in creating distinctive character voices is impressive, and she's an excellent teacher."
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtistPortfolio;
