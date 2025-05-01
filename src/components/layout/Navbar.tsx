
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Ticket } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-entertainment-600 to-entertainment-400 bg-clip-text text-transparent">
              MediaMuse
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-x-8">
          <Link to="/" className="text-sm font-medium hover:text-entertainment-600 transition-colors">
            Home
          </Link>
          <Link to="/events" className="text-sm font-medium hover:text-entertainment-600 transition-colors">
            Events
          </Link>
          <Link to="/artists" className="text-sm font-medium hover:text-entertainment-600 transition-colors">
            Artists
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-entertainment-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Ticket className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <User className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline" 
            className="hidden md:flex bg-entertainment-500 text-white hover:bg-entertainment-600 border-none"
          >
            Sign In
          </Button>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                onClick={toggleMenu}
              >
                Events
              </Link>
              <Link 
                to="/artists" 
                className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                onClick={toggleMenu}
              >
                Artists
              </Link>
              <Link 
                to="/about" 
                className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                onClick={toggleMenu}
              >
                About
              </Link>
              <Button 
                variant="outline" 
                className="bg-entertainment-500 text-white hover:bg-entertainment-600 border-none w-full"
                onClick={toggleMenu}
              >
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
