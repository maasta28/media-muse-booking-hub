
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  fetchArtistById, 
  fetchPortfolioItems, 
  savePortfolioItem, 
  uploadPortfolioMedia, 
  deletePortfolioItem, 
  PortfolioItem 
} from "@/services/artistService";
import { 
  checkPortfolioLimits,
  validateFileSize,
  getMediaCounts 
} from "@/services/portfolioService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Calendar, Clock, MapPin, Image, Video, Link, Edit, Trash2, Plus, Instagram, Linkedin, Facebook, Youtube, ExternalLink, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form schema for portfolio item
const portfolioItemSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(2, "Description is required"),
  media_url: z.string().min(2, "Media URL is required"),
  media_type: z.enum(["image", "video", "link", "social"], {
    required_error: "Please select a media type",
  }),
  social_platform: z.enum(["instagram", "youtube", "tiktok", "facebook", "twitter", "linkedin", "other"]).optional(),
});

type PortfolioItemFormValues = z.infer<typeof portfolioItemSchema>;

const ArtistPortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [mediaCounts, setMediaCounts] = useState({ images: 0, videos: 0 });

  // Fetch artist data
  const { 
    data: artist, 
    isLoading: isLoadingArtist, 
    error: artistError 
  } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => fetchArtistById(id!),
  });

  // Fetch portfolio items
  const {
    data: portfolioItems = [],
    isLoading: isLoadingItems,
    refetch: refetchPortfolioItems
  } = useQuery({
    queryKey: ["portfolio-items", id],
    queryFn: () => fetchPortfolioItems(id!),
    enabled: !!id,
    onSuccess: (data) => {
      const images = data.filter(item => item.media_type === 'image').length;
      const videos = data.filter(item => item.media_type === 'video').length;
      setMediaCounts({ images, videos });
    }
  });

  // Check if the user is allowed to edit this profile
  const canEdit = user && (id === user.id);

  // Setup form for portfolio item
  const portfolioForm = useForm<PortfolioItemFormValues>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      title: "",
      description: "",
      media_url: "",
      media_type: "image",
    },
  });

  // Save portfolio item mutation
  const saveItemMutation = useMutation({
    mutationFn: async (values: PortfolioItemFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to save portfolio items");
      }

      // Check upload limits if this is a new item
      if (!currentItem) {
        if (values.media_type === 'image' || values.media_type === 'video') {
          const canUpload = await checkPortfolioLimits(id!, values.media_type);
          if (!canUpload) {
            const errorMessage = `You can only upload up to ${values.media_type === 'image' ? '3 images' : '3 videos'}. Please remove existing files to upload new ones.`;
            setLimitError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }

      // Reset any previous errors
      setLimitError(null);
      
      // If there's a new media file for image or video type, upload it first
      let mediaUrl = values.media_url;
      
      if (mediaFile && values.media_type === "image") {
        // Validate file size
        if (!validateFileSize(mediaFile, 'image')) {
          throw new Error("Image file size cannot exceed 5MB");
        }
        
        setUploadProgress(10);
        try {
          mediaUrl = await uploadPortfolioMedia(mediaFile, 'portfolio-images');
          setUploadProgress(100);
        } catch (error) {
          setUploadProgress(0);
          throw error;
        }
      } else if (mediaFile && values.media_type === "video") {
        // Validate file size
        if (!validateFileSize(mediaFile, 'video')) {
          throw new Error("Video file size cannot exceed 50MB");
        }
        
        setUploadProgress(10);
        try {
          mediaUrl = await uploadPortfolioMedia(mediaFile, 'portfolio-videos');
          setUploadProgress(100);
        } catch (error) {
          setUploadProgress(0);
          throw error;
        }
      }

      // Save the portfolio item
      return await savePortfolioItem({
        id: currentItem?.id,
        artist_id: id!,
        ...values,
        media_url: mediaUrl,
        social_platform: values.media_type === 'social' ? values.social_platform : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items", id] });
      setIsPortfolioDialogOpen(false);
      setCurrentItem(null);
      setMediaFile(null);
      setMediaPreview(null);
      setVideoUrl(null);
      setUploadProgress(0);
      portfolioForm.reset();
      toast.success("Portfolio item saved successfully");
      refetchPortfolioItems();
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast.error(error.message || "Failed to save portfolio item");
    }
  });

  // Delete portfolio item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deletePortfolioItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items", id] });
      toast.success("Portfolio item deleted successfully");
      refetchPortfolioItems();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete portfolio item");
    }
  });

  const openPortfolioDialog = (item?: PortfolioItem) => {
    setLimitError(null);
    
    if (!user) {
      toast.error("Please sign in to manage your portfolio");
      navigate("/auth");
      return;
    }

    if (id !== user.id) {
      toast.error("You can only edit your own portfolio");
      return;
    }

    if (item) {
      setCurrentItem(item);
      portfolioForm.reset({
        title: item.title,
        description: item.description,
        media_url: item.media_url,
        media_type: item.media_type,
        social_platform: item.social_platform,
      });
      if (item.media_type === "image") {
        setMediaPreview(item.media_url);
      } else if (item.media_type === "video") {
        setVideoUrl(item.media_url);
      }
    } else {
      setCurrentItem(null);
      portfolioForm.reset();
      setMediaPreview(null);
      setVideoUrl(null);
      setMediaFile(null);
    }
    
    setIsPortfolioDialogOpen(true);
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const mediaType = portfolioForm.getValues("media_type");
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      toast.error("Please select a valid image file (JPG, PNG)");
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      toast.error("Please select a valid video file (MP4, WebM)");
      return;
    }
    
    // Validate file size
    const isValidSize = validateFileSize(
      file, 
      mediaType as 'image' | 'video'
    );
    if (!isValidSize) {
      toast.error(
        `File size is too large. Maximum size allowed is ${mediaType === 'image' ? '5MB' : '50MB'}`
      );
      return;
    }
    
    setMediaFile(file);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        portfolioForm.setValue("media_url", "pending_upload");
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // For video files, just store the file and set the media_url
      portfolioForm.setValue("media_url", "pending_upload");
      // Create a temporary object URL for preview
      const fileUrl = URL.createObjectURL(file);
      setVideoUrl(fileUrl);
    }
  };

  const onPortfolioItemSubmit = (values: PortfolioItemFormValues) => {
    saveItemMutation.mutate(values);
  };

  const handleMediaTypeChange = (value: "image" | "video" | "link" | "social") => {
    portfolioForm.setValue("media_type", value);
    // Reset file-related states when changing media type
    setMediaFile(null);
    setMediaPreview(null);
    setVideoUrl(null);
    portfolioForm.setValue("media_url", "");
    setLimitError(null);
    
    // Check limits for the selected media type
    if ((value === 'image' && mediaCounts.images >= 3) || 
        (value === 'video' && mediaCounts.videos >= 3)) {
      setLimitError(
        `You can only upload up to 3 ${value}s. Please remove existing files to upload new ones.`
      );
    }
    
    // If switching to social, set a default social platform
    if (value === "social") {
      portfolioForm.setValue("social_platform", "instagram");
    } else {
      portfolioForm.setValue("social_platform", undefined);
    }
  };

  // Helper to render social media icon
  const renderSocialIcon = (platform?: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6 text-maasta-secondary" />;
      case 'facebook':
        return <Facebook className="w-6 h-6 text-maasta-secondary" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6 text-maasta-secondary" />;
      case 'youtube':
        return <Youtube className="w-6 h-6 text-maasta-secondary" />;
      default:
        return <ExternalLink className="w-6 h-6 text-maasta-secondary" />;
    }
  };

  if (isLoadingArtist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-maasta-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading artist profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Artist Not Found</h2>
            <p className="text-gray-600">The artist profile you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate("/artists")} 
              variant="outline"
              className="mt-4"
            >
              Browse Artists
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={artist.image_url || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80"} 
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
                    src={artist.image_url || "/placeholder.svg"}
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
                      <span className="text-sm text-gray-500">Location placeholder</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.category_names?.map((category, index) => (
                        <Badge key={index} variant="secondary" className="bg-maasta-primary/20 text-maasta-primary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-4 md:mt-0 space-y-2">
                    {canEdit && (
                      <Button 
                        onClick={() => navigate(`/artist/edit/${id}`)}
                        className="border-maasta-primary text-maasta-primary hover:bg-maasta-primary/10"
                        variant="outline"
                      >
                        <Edit size={18} className="mr-1" />
                        Edit Profile
                      </Button>
                    )}
                    <Button className="bg-maasta-primary hover:bg-maasta-primary/80">
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
                          className={`w-4 h-4 ${i < Math.floor(artist.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
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
                    <span className="text-sm font-medium">{artist.rating || "No ratings"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium">0</span>
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
                <p className="text-gray-700 mb-8">{artist.bio || "No biography provided."}</p>
                
                <h3 className="text-lg font-semibold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {artist.category_names?.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-100">
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
                  {canEdit && (
                    <Button 
                      onClick={() => openPortfolioDialog()} 
                      className="bg-maasta-primary hover:bg-maasta-primary/80"
                    >
                      <Plus size={18} className="mr-1" />
                      Add Item
                    </Button>
                  )}
                </div>
                
                {!user && (
                  <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      <span className="font-semibold">You are viewing this portfolio as a guest.</span> To create your own portfolio, please{' '}
                      <Button 
                        variant="link" 
                        onClick={() => navigate('/auth')} 
                        className="p-0 h-auto text-blue-600 font-semibold"
                      >
                        sign in or register
                      </Button>.
                    </AlertDescription>
                  </Alert>
                )}
                
                {canEdit && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className={`p-3 bg-gray-50 rounded-lg border ${mediaCounts.images >= 3 ? 'border-amber-400' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium mb-1">Images</div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">{mediaCounts.images}</span>
                        <span className="text-gray-500 ml-1">/ 3</span>
                      </div>
                    </div>
                    <div className={`p-3 bg-gray-50 rounded-lg border ${mediaCounts.videos >= 3 ? 'border-amber-400' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium mb-1">Videos</div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">{mediaCounts.videos}</span>
                        <span className="text-gray-500 ml-1">/ 3</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {isLoadingItems ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-maasta-primary border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading portfolio items...</p>
                  </div>
                ) : portfolioItems.length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-gray-50">
                    <div className="mb-4">
                      {canEdit ? (
                        <>
                          <p className="text-gray-600 mb-4">You haven't added any portfolio items yet.</p>
                          <Button 
                            onClick={() => openPortfolioDialog()} 
                            className="bg-maasta-primary hover:bg-maasta-primary/80"
                          >
                            <Plus size={18} className="mr-1" />
                            Add Your First Item
                          </Button>
                        </>
                      ) : (
                        <p className="text-gray-600">This artist hasn't added any portfolio items yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md">
                        <div className="aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                          {item.media_type === "image" ? (
                            <img 
                              src={item.media_url} 
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : item.media_type === "video" ? (
                            <video 
                              src={item.media_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : item.media_type === "social" ? (
                            <div className="flex flex-col items-center justify-center p-4">
                              {renderSocialIcon(item.social_platform)}
                              <a 
                                href={item.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-maasta-secondary hover:underline mt-2"
                              >
                                {item.title}
                              </a>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              <Link className="w-12 h-12 text-maasta-secondary mb-2" />
                              <a 
                                href={item.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-maasta-secondary hover:underline"
                              >
                                {item.media_url}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-lg">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                          
                          {canEdit && (
                            <div className="flex justify-end mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-maasta-primary"
                                onClick={() => openPortfolioDialog(item)}
                              >
                                <Edit size={16} />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this portfolio item.
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteItemMutation.mutate(item.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
                
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming events scheduled at the moment.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Reviews</h2>
                
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Portfolio Item Dialog */}
      <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</DialogTitle>
            <DialogDescription>
              Share your work, performances, or media to showcase your talent.
            </DialogDescription>
          </DialogHeader>
          
          {limitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{limitError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...portfolioForm}>
            <form onSubmit={portfolioForm.handleSubmit(onPortfolioItemSubmit)} className="space-y-6">
              <FormField
                control={portfolioForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for this work" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={portfolioForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this work, performance, or creation" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={portfolioForm.control}
                name="media_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: "image" | "video" | "link" | "social") => {
                          handleMediaTypeChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image" disabled={mediaCounts.images >= 3 && !currentItem?.media_type.includes("image")}>
                            Image {mediaCounts.images >= 3 && !currentItem?.media_type.includes("image") && "(Limit reached)"}
                          </SelectItem>
                          <SelectItem value="video" disabled={mediaCounts.videos >= 3 && !currentItem?.media_type.includes("video")}>
                            Video {mediaCounts.videos >= 3 && !currentItem?.media_type.includes("video") && "(Limit reached)"}
                          </SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                          <SelectItem value="social">Social Media Profile</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {portfolioForm.watch("media_type") === "image" ? (
                <div>
                  <FormLabel>Image</FormLabel>
                  <div className="mt-2 mb-1 text-xs text-gray-500">
                    Max file size: 5MB. Formats: JPG, PNG
                  </div>
                  <div className="mt-2">
                    {mediaPreview ? (
                      <div className="relative mb-4">
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-[200px] rounded-md object-contain bg-gray-100 w-full"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setMediaPreview(null);
                            setMediaFile(null);
                            portfolioForm.setValue("media_url", "");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("portfolioImage")?.click()}
                          disabled={mediaCounts.images >= 3 && !currentItem}
                        >
                          Upload Image
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      id="portfolioImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMediaFileChange}
                    />
                  </div>
                </div>
              ) : portfolioForm.watch("media_type") === "video" ? (
                <div>
                  <FormLabel>Video</FormLabel>
                  <div className="mt-2 mb-1 text-xs text-gray-500">
                    Max file size: 50MB. Formats: MP4, WebM
                  </div>
                  <div className="mt-2">
                    {videoUrl ? (
                      <div className="relative mb-4">
                        <video
                          src={videoUrl}
                          controls
                          className="max-h-[200px] rounded-md bg-gray-100 w-full"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setVideoUrl(null);
                            setMediaFile(null);
                            portfolioForm.setValue("media_url", "");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("portfolioVideo")?.click()}
                          disabled={mediaCounts.videos >= 3 && !currentItem}
                        >
                          Upload Video
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          MP4, WebM up to 50MB
                        </p>
                      </div>
                    )}
                    <input
                      id="portfolioVideo"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleMediaFileChange}
                    />
                  </div>
                </div>
              ) : portfolioForm.watch("media_type") === "social" ? (
                <>
                  <FormField
                    control={portfolioForm.control}
                    name="social_platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Platform</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={portfolioForm.control}
                    name="media_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., https://www.instagram.com/yourprofile" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={portfolioForm.control}
                  name="media_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        External Link URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., https://www.yourportfolio.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-maasta-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPortfolioDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={saveItemMutation.isPending || !!limitError}
                  className="bg-maasta-primary hover:bg-maasta-primary/80"
                >
                  {saveItemMutation.isPending ? "Saving..." : currentItem ? "Save Changes" : "Add to Portfolio"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ArtistPortfolio;
