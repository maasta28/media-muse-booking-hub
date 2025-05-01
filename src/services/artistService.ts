
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ArtistWithCategory = Database['public']['Tables']['artists']['Row'] & {
  categories?: { name: string }[];
  category_names?: string[];
};

export type PortfolioItem = {
  id: string;
  artist_id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video' | 'link';
  created_at?: string;
}

/**
 * Fetches all artists with optional filtering
 */
export const fetchArtists = async (params?: {
  search?: string;
  category?: string;
}) => {
  try {
    let query = supabase
      .from('artists')
      .select(`
        *,
        artist_categories(
          categories(name)
        )
      `);

    // Apply search filter if provided
    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(`name.ilike.${searchTerm},profession.ilike.${searchTerm},bio.ilike.${searchTerm}`);
    }

    // Apply category filter if provided
    if (params?.category && params.category !== 'all') {
      query = query.eq('artist_categories.categories.name', params.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching artists:", error);
      throw new Error(`Failed to fetch artists: ${error.message}`);
    }

    // Transform the data to match our expected format
    return data.map(artist => ({
      ...artist,
      category_names: artist.artist_categories?.map(ac => ac.categories?.name) || []
    }));
  } catch (error) {
    console.error("Error in fetchArtists:", error);
    throw error;
  }
};

/**
 * Fetches a single artist by ID
 */
export const fetchArtistById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select(`
        *,
        artist_categories(
          categories(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching artist:", error);
      throw new Error(`Failed to fetch artist: ${error.message}`);
    }

    return {
      ...data,
      category_names: data.artist_categories?.map(ac => ac.categories?.name) || []
    };
  } catch (error) {
    console.error("Error in fetchArtistById:", error);
    throw error;
  }
};

/**
 * Creates or updates an artist profile
 */
export const saveArtist = async (artist: Partial<Database['public']['Tables']['artists']['Insert']>, categories?: string[]) => {
  try {
    const isUpdate = !!artist.id;
    
    // 1. Upsert the artist
    const { data: artistData, error: artistError } = isUpdate 
      ? await supabase
          .from('artists')
          .update({
            name: artist.name,
            profession: artist.profession,
            bio: artist.bio,
            image_url: artist.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', artist.id!)
          .select()
          .single()
      : await supabase
          .from('artists')
          .insert({
            name: artist.name!,
            profession: artist.profession!,
            bio: artist.bio,
            image_url: artist.image_url,
          })
          .select()
          .single();

    if (artistError) {
      throw new Error(`Failed to save artist: ${artistError.message}`);
    }
    
    const artistId = artistData.id;

    // 2. If categories were provided, update artist categories
    if (categories && categories.length > 0) {
      // First, remove existing categories
      if (isUpdate) {
        await supabase.from('artist_categories')
          .delete()
          .eq('artist_id', artistId);
      }
      
      // Fetch category IDs
      const { data: categoryData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .in('name', categories);
        
      if (catError) {
        throw new Error(`Failed to fetch categories: ${catError.message}`);
      }
      
      // Insert new category associations
      if (categoryData && categoryData.length > 0) {
        const categoryInserts = categoryData.map(category => ({
          artist_id: artistId,
          category_id: category.id
        }));
        
        const { error: insertError } = await supabase
          .from('artist_categories')
          .insert(categoryInserts);
          
        if (insertError) {
          throw new Error(`Failed to link categories: ${insertError.message}`);
        }
      }
    }

    return artistData;
  } catch (error) {
    console.error("Error in saveArtist:", error);
    throw error;
  }
};

/**
 * Deletes an artist and all associated data
 */
export const deleteArtist = async (id: string) => {
  try {
    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete artist: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteArtist:", error);
    throw error;
  }
};

/**
 * Fetches portfolio items for an artist
 */
export const fetchPortfolioItems = async (artistId: string) => {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch portfolio items: ${error.message}`);
    }

    return data as PortfolioItem[];
  } catch (error) {
    console.error("Error in fetchPortfolioItems:", error);
    throw error;
  }
};

/**
 * Creates or updates a portfolio item
 */
export const savePortfolioItem = async (item: Partial<PortfolioItem>) => {
  try {
    const isUpdate = !!item.id;
    
    const { data, error } = isUpdate
      ? await supabase
          .from('portfolio_items')
          .update({
            title: item.title,
            description: item.description,
            media_url: item.media_url,
            media_type: item.media_type
          })
          .eq('id', item.id!)
          .select()
          .single()
      : await supabase
          .from('portfolio_items')
          .insert({
            artist_id: item.artist_id!,
            title: item.title!,
            description: item.description!,
            media_url: item.media_url!,
            media_type: item.media_type!
          })
          .select()
          .single();

    if (error) {
      throw new Error(`Failed to save portfolio item: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in savePortfolioItem:", error);
    throw error;
  }
};

/**
 * Deletes a portfolio item
 */
export const deletePortfolioItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete portfolio item: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in deletePortfolioItem:", error);
    throw error;
  }
};
