
import { supabase } from "@/integrations/supabase/client";
import { PortfolioItem } from "./artistService";

const MAX_IMAGES = 3;
const MAX_VIDEOS = 3;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

/**
 * Checks if the artist has reached their upload limits
 */
export const checkPortfolioLimits = async (
  artistId: string, 
  mediaType: 'image' | 'video'
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('artist_id', artistId)
      .eq('media_type', mediaType);
    
    if (error) {
      throw new Error(`Failed to check portfolio limits: ${error.message}`);
    }
    
    const count = data?.length || 0;
    const limit = mediaType === 'image' ? MAX_IMAGES : MAX_VIDEOS;
    
    return count < limit;
  } catch (error) {
    console.error("Error checking portfolio limits:", error);
    throw error;
  }
};

/**
 * Validates file size before upload
 */
export const validateFileSize = (file: File, type: 'image' | 'video'): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  const maxSizeMB = type === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
  
  return fileSizeMB <= maxSizeMB;
};

/**
 * Gets the count of each media type for an artist
 */
export const getMediaCounts = async (artistId: string): Promise<{ images: number; videos: number }> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('media_type')
      .eq('artist_id', artistId);
    
    if (error) {
      throw new Error(`Failed to get media counts: ${error.message}`);
    }
    
    const images = data.filter(item => item.media_type === 'image').length;
    const videos = data.filter(item => item.media_type === 'video').length;
    
    return { images, videos };
  } catch (error) {
    console.error("Error getting media counts:", error);
    throw { images: 0, videos: 0 };
  }
};

/**
 * Checks if the user already has an artist profile
 */
export const checkUserHasProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check user profile: ${error.message}`);
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};

/**
 * Upload multiple portfolio media files
 */
export const uploadMultiplePortfolioMedia = async (
  files: File[],
  folder: string,
  mediaType: 'image' | 'video'
): Promise<string[]> => {
  const urls: string[] = [];
  
  for (const file of files) {
    // Validate file size
    if (!validateFileSize(file, mediaType)) {
      throw new Error(
        `File "${file.name}" exceeds maximum size of ${mediaType === 'image' ? '5MB' : '50MB'}`
      );
    }
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(folder)
      .upload(fileName, file);
    
    if (error) {
      throw new Error(`Failed to upload file "${file.name}": ${error.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(folder)
      .getPublicUrl(fileName);
      
    urls.push(publicUrlData.publicUrl);
  }
  
  return urls;
};
