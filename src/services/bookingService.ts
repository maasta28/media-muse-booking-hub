
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Booking = Database['public']['Tables']['bookings']['Row'];

export const createBooking = async (
  eventId: string,
  userId: string,
  seatCount: number,
  totalAmount: number
): Promise<Booking> => {
  try {
    // First create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_id: eventId,
        user_id: userId,
        seat_count: seatCount,
        total_amount: totalAmount,
        booking_date: new Date().toISOString(),
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    // Update available seats in the event using a direct update with a calculation
    const { data: updatedSeats, error: updateError } = await supabase
      .rpc('decrement_seats', {
        event_id_param: eventId,
        seats_to_remove: seatCount
      });

    if (updateError) {
      console.error("Error updating seats:", updateError);
      throw new Error(`Failed to update available seats: ${updateError.message}`);
    }

    // Update the event with the new seats value
    const { error: eventError } = await supabase
      .from('events')
      .update({ available_seats: updatedSeats })
      .eq('id', eventId);

    if (eventError) {
      console.error("Error updating event:", eventError);
      throw new Error(`Failed to update event: ${eventError.message}`);
    }

    return data;
  } catch (error: any) {
    console.error("Error in createBooking:", error);
    throw error;
  }
};

export const getBookingsByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          title,
          event_date,
          event_time,
          venue,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getBookingsByUser:", error);
    throw error;
  }
};
