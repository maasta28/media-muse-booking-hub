
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ArtistCardProps {
  id: string;
  name: string;
  profession: string;
  imageUrl: string;
  rating: number;
  categories: string[];
}

const ArtistCard = ({ id, name, profession, imageUrl, rating, categories }: ArtistCardProps) => {
  return (
    <Link to={`/artist/${id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="aspect-square overflow-hidden">
          <img 
            src={imageUrl} 
            alt={`${name} - ${profession}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <p className="text-sm text-muted-foreground">{profession}</p>
          
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {Array(5).fill(0).map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
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
            <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
          {categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary" className="bg-entertainment-100 text-entertainment-700 hover:bg-entertainment-200">
              {category}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ArtistCard;
