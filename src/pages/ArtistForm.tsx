import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { fetchArtistById, saveArtist, deleteArtist } from "@/services/artistService";
import { fetchCategories } from "@/services/eventService";
import { Upload, Save, Trash2, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  profession: z.string().min(2, "Profession is required"),
  bio: z.string().optional(),
  image_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ArtistForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch artist data if editing
  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => fetchArtistById(id!),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      profession: "",
      bio: "",
      image_url: "",
    },
  });

  // Set form values when artist data is loaded
  useEffect(() => {
    if (artist) {
      form.reset({
        name: artist.name,
        profession: artist.profession,
        bio: artist.bio || "",
        image_url: artist.image_url || "",
      });
      setImagePreview(artist.image_url || null);
      setSelectedCategories(artist.category_names || []);
    }
  }, [artist, form]);

  // Save artist mutation
  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // If there's a new image file, upload it first
      let imageUrl = values.image_url;
      
      if (imageFile) {
        // Generate a unique filename
        const timestamp = new Date().getTime();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artist-images')
          .upload(fileName, imageFile);
        
        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        
        // Get the public URL
        const { data: publicUrl } = supabase.storage
          .from('artist-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl.publicUrl;
      }

      // Save the artist data
      return await saveArtist(
        { 
          id: isEditing ? id : undefined,
          ...values,
          image_url: imageUrl
        },
        selectedCategories
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", id] });
      navigate(`/artist/${id || "my-profile"}`);
      toast.success(isEditing ? "Artist profile updated successfully" : "Artist profile created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save artist profile");
    }
  });

  // Delete artist mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteArtist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      navigate("/artists");
      toast.success("Artist profile deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete artist profile");
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mr-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEditing ? "Edit Artist Profile" : "Create Artist Profile"}
          </h1>
        </div>

        {isEditing && isLoadingArtist ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-entertainment-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist/Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession/Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jazz Musician, Stand-up Comedian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Categories</FormLabel>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Badge
                            key={category.id}
                            variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedCategories.includes(category.name)
                                ? "bg-entertainment-600 hover:bg-entertainment-700"
                                : "hover:bg-entertainment-100"
                            }`}
                            onClick={() => toggleCategory(category.name)}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      {selectedCategories.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Please select at least one category
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <FormLabel>Profile Image</FormLabel>
                      <div className="mt-2 flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {imagePreview ? (
                          <div className="relative w-48 h-48 mb-4">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute bottom-2 right-2"
                              onClick={() => {
                                setImagePreview(null);
                                setImageFile(null);
                                form.setValue("image_url", "");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center">
                            <Upload className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("imageUpload")?.click()}
                        >
                          {imagePreview ? "Change Image" : "Upload Image"}
                        </Button>
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square image, at least 300x300px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio/Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself or your group..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>

                  <div className="flex gap-2">
                    {isEditing && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" type="button">
                            <Trash2 size={18} className="mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your artist profile and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      className="bg-entertainment-600 hover:bg-entertainment-700"
                    >
                      <Save size={18} className="mr-1" />
                      {saveMutation.isPending ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArtistForm;
