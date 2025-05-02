
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCategories } from "@/services/eventService";
import { fetchArtists, ArtistWithCategory } from "@/services/artistService";
import ArtistCard from "@/components/ui/ArtistCard";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Search, Plus } from "lucide-react";

const Artists = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch artists with filters
  const {
    data: artists = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["artists", debouncedSearch, selectedCategory],
    queryFn: () =>
      fetchArtists({
        search: debouncedSearch,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Artists</h1>
            <p className="text-gray-600">
              Discover talented artists for your next event
            </p>
          </div>

          <Link to="/artist/create">
            <Button className="bg-entertainment-600 hover:bg-entertainment-700">
              <Plus size={18} className="mr-1" />
              Create Artist Profile
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by artist name, profession..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-4 overflow-x-auto flex flex-nowrap w-full">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-entertainment-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading artists...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading artists. Please try again later.</p>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <p className="text-gray-600">No artists found matching your criteria.</p>
            {selectedCategory !== "all" || debouncedSearch ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Link to="/artist/create">
                <Button className="mt-4 bg-entertainment-600 hover:bg-entertainment-700">
                  Create Your Artist Profile
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map((artist: ArtistWithCategory) => (
              <ArtistCard
                key={artist.id}
                id={artist.id}
                name={artist.name}
                profession={artist.profession}
                imageUrl={artist.image_url || "/placeholder.svg"}
                rating={artist.rating || 0}
                categories={artist.category_names || []}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Artists;
