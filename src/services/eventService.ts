
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type EventWithCategory = Database['public']['Tables']['events']['Row'] & {
  category_name?: string;
};

/**
 * Fetches all events with optional filtering
 * @param params Optional search and filter parameters
 * @returns Promise with events data
 */
export const fetchEvents = async (params?: {
  search?: string;
  category?: string;
  city?: string;
}) => {
  try {
    let query = supabase
      .from('events')
      .select(`
        *,
        categories:category_id (name)
      `);

    // Apply search filter if provided
    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(`title.ilike.${searchTerm},venue.ilike.${searchTerm},city.ilike.${searchTerm}`);
    }

    // Apply category filter if provided
    if (params?.category && params.category !== 'all') {
      query = query.eq('categories.name', params.category);
    }

    // Apply city filter if provided
    if (params?.city) {
      query = query.eq('city', params.city);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // Transform the data to match our expected format
    return data.map(event => ({
      ...event,
      category_name: event.categories?.name
    }));
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    throw error;
  }
};

/**
 * Fetches a single event by ID
 * @param id The event ID to fetch
 * @returns Promise with event data
 */
export const fetchEventById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        categories:category_id (name),
        artists:artist_id (name, profession, bio, image_url, rating)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return {
      ...data,
      category_name: data.categories?.name
    };
  } catch (error) {
    console.error("Error in fetchEventById:", error);
    throw error;
  }
};

/**
 * Fetches distinct categories for filtering
 * @returns Promise with categories data
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    throw error;
  }
};
