
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
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Failed to check user profile: ${error.message}`);
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};
