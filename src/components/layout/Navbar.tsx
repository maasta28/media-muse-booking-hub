
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Ticket, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, signOut, isOrganizer } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Successfully signed out");
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
            Talents
          </Link>
          {isOrganizer && (
            <Link to="/organizer/dashboard" className="text-sm font-medium hover:text-entertainment-600 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Ticket className="h-5 w-5" />
          </Button>

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {isOrganizer && (
                  <DropdownMenuItem asChild>
                    <Link to="/organizer/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/bookings">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              className="hidden md:flex bg-entertainment-500 text-white hover:bg-entertainment-600 border-none"
              asChild
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}

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
                Talents
              </Link>
              {isOrganizer && (
                <Link 
                  to="/organizer/dashboard" 
                  className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              )}
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/bookings" 
                    className="text-sm font-medium hover:text-entertainment-600 transition-colors p-2"
                    onClick={toggleMenu}
                  >
                    My Bookings
                  </Link>
                  <Button 
                    variant="ghost"
                    className="justify-start text-red-500 hover:bg-red-50 hover:text-red-600 p-2"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="bg-entertainment-500 text-white hover:bg-entertainment-600 border-none w-full"
                  onClick={toggleMenu}
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
