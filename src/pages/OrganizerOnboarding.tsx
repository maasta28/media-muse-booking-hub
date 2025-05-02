
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const organizerSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  company_description: z.string().min(10, { message: "Please provide a brief description of your company" }),
  company_website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  company_logo: z.any().optional(),
});

const OrganizerOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check if user is logged in
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const form = useForm<z.infer<typeof organizerSchema>>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      company_name: "",
      company_description: "",
      company_website: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (userId: string) => {
    if (!logoFile) return null;
    
    const fileExt = logoFile.name.split(".").pop();
    const filePath = `${userId}/company_logo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("company_logos")
      .upload(filePath, logoFile);
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: urlData } = supabase.storage
      .from("company_logos")
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const onSubmit = async (values: z.infer<typeof organizerSchema>) => {
    if (!session?.user) {
      toast.error("You must be logged in to complete your profile");
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(session.user.id);
      }
      
      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          is_organizer: true,
          company_name: values.company_name,
          company_description: values.company_description,
          company_website: values.company_website || null,
          company_logo: logoUrl,
        })
        .eq("id", session.user.id);
      
      if (error) throw error;
      
      toast.success("Organizer profile created successfully!");
      navigate("/organizer/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create organizer profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-entertainment-600" />
      </div>
    );
  }

  if (!session) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Complete Your Organizer Profile</h1>
          <div className="bg-white rounded-lg shadow-md p-6 border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Your Organization</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your organization, events you organize, etc." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_logo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Company Logo (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <label 
                              htmlFor="logo-upload" 
                              className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              <Upload size={18} />
                              <span>Upload Logo</span>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                              />
                            </label>
                            {logoFile && (
                              <span className="text-sm text-gray-500">
                                {logoFile.name}
                              </span>
                            )}
                          </div>
                          
                          {logoPreview && (
                            <div className="mt-2">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                className="max-h-40 rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a logo for your organization (max 5MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-entertainment-600 hover:bg-entertainment-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Complete Profile
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizerOnboarding;
