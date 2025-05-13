
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories } from "@/services/eventService";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar, Clock, MapPin, Upload, Image, Save } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category_id: z.string().min(1, "Please select a category"),
  event_date: z.string().min(1, "Please select a date"),
  event_time: z.string().min(1, "Please select a time"),
  venue: z.string().min(3, "Venue is required"),
  city: z.string().min(2, "City is required"),
  price_start: z.coerce.number().min(0, "Price must be a positive number"),
  price_end: z.coerce.number().min(0, "Price must be a positive number").optional(),
  available_seats: z.coerce.number().min(1, "At least 1 seat must be available"),
  image_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EventCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      event_date: new Date().toISOString().split('T')[0], // Today as default
      event_time: "19:00", // 7:00 PM as default
      venue: "",
      city: "",
      price_start: 0,
      price_end: undefined,
      available_seats: 100,
      image_url: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      navigate("/auth", { state: { returnTo: "/event/create" } });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload image if provided
      let imageUrl = data.image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Create event in database
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          category_id: data.category_id,
          event_date: data.event_date,
          event_time: data.event_time,
          venue: data.venue,
          city: data.city,
          price_start: data.price_start,
          price_end: data.price_end,
          available_seats: data.available_seats,
          image_url: imageUrl || null,
          organizer_id: user.id,
        })
        .select()
        .single();

      if (eventError) {
        console.error("Error creating event:", eventError);
        throw new Error(`Failed to create event: ${eventError.message}`);
      }

      toast.success("Event created successfully!");
      navigate(`/event/${eventData.id}`);
    } catch (error) {
      console.error("Error in event creation:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Create an Event</h1>
          <p className="text-gray-600 mb-8">Fill out the details below to list your event</p>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Event Details */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the title of your event" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your event details, performers, what to expect..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md">
                                <Calendar className="ml-3 h-4 w-4 text-gray-500" />
                                <Input 
                                  type="date" 
                                  className="border-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="event_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md">
                                <Clock className="ml-3 h-4 w-4 text-gray-500" />
                                <Input 
                                  type="time" 
                                  className="border-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md">
                              <MapPin className="ml-3 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="Venue name" 
                                className="border-0" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Right Column - Pricing, Image, etc */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Price ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price_end"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Ending Price ($) (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={value === undefined ? "" : value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  onChange(val === "" ? undefined : Number(val));
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="available_seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Seats</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Image</FormLabel>
                          <div className="border rounded-md p-4">
                            {imagePreview ? (
                              <div className="mb-4">
                                <AspectRatio ratio={16 / 9} className="bg-muted">
                                  <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="rounded-md object-cover w-full h-full"
                                  />
                                </AspectRatio>
                              </div>
                            ) : field.value ? (
                              <div className="mb-4">
                                <AspectRatio ratio={16 / 9} className="bg-muted">
                                  <img
                                    src={field.value}
                                    alt="Event preview"
                                    className="rounded-md object-cover w-full h-full"
                                  />
                                </AspectRatio>
                              </div>
                            ) : (
                              <div className="mb-4 flex flex-col items-center justify-center border-2 border-dashed rounded-md py-8">
                                <Image className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">Upload an event image</p>
                                <p className="text-xs text-gray-400 mt-1">Recommended ratio: 16:9</p>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Input 
                                type="file" 
                                id="event-image" 
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange} 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('event-image')?.click()}
                                className="w-full"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </Button>
                            </div>
                            <FormDescription className="text-xs mt-2">
                              For event banner and promotional materials
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 mt-8 flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-entertainment-600 hover:bg-entertainment-700"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Creating Event..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventCreate;
