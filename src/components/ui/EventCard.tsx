
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingModal from "../events/BookingModal";

export interface EventCardProps {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  price: string;
  availableSeats?: number; // Optional prop for available seats
}

const EventCard = ({ 
  id, 
  title, 
  imageUrl, 
  date, 
  time, 
  venue, 
  city, 
  category, 
  price, 
  availableSeats = 0 
}: EventCardProps) => {
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);

  // Parse price from string (e.g. "$25" or "$25 - $45") to get the lowest price
  const parsePrice = (priceString: string): number => {
    const match = priceString.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const priceValue = parsePrice(price);

  return (
    <>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <Link to={`/event/${id}`} className="block">
          <div className="relative overflow-hidden h-48">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-entertainment-600 hover:bg-entertainment-700 text-white">
                {category}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-entertainment-500" />
                <span>{date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-entertainment-500" />
                <span>{time}</span>
              </div>
              <div className="text-gray-700 font-medium">
                {venue}, {city}
              </div>
            </div>
          </CardContent>
        </Link>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-entertainment-600 font-semibold">
            {price}
          </div>
          <Button 
            variant="outline" 
            className="text-entertainment-600 border-entertainment-600 hover:bg-entertainment-50"
            onClick={(e) => {
              e.preventDefault();
              setBookingModalOpen(true);
            }}
            disabled={availableSeats <= 0}
          >
            {availableSeats <= 0 ? "Sold Out" : "Book Now"}
          </Button>
        </CardFooter>
      </Card>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        eventId={id}
        eventTitle={title}
        price={priceValue}
        maxSeats={availableSeats}
      />
    </>
  );
};

export default EventCard;
