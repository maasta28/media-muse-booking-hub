
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BookingFormData = {
  eventId: string;
  seatCount: number;
  userId: string;
  totalAmount: number;
};

export const createBooking = async (bookingData: BookingFormData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_id: bookingData.eventId,
        user_id: bookingData.userId,
        seat_count: bookingData.seatCount,
        total_amount: bookingData.totalAmount,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    // Update available seats in the event using a direct update with a calculation
    const { error: updateError } = await supabase
      .from('events')
      .update({ 
        available_seats: supabase.rpc('decrement_seats', { 
          event_id_param: bookingData.eventId, 
          seats_to_remove: bookingData.seatCount 
        })
      })
      .eq('id', bookingData.eventId);

    if (updateError) {
      console.error("Error updating event seats:", updateError);
      // We don't throw here to avoid blocking the booking creation
      toast.error("Booking created but failed to update available seats.");
    }

    return data;
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error;
  }
};
