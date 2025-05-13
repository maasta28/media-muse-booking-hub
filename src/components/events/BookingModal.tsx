
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Minus, Plus, Ticket } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createBooking } from "@/services/bookingService";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  price: number;
  maxSeats: number;
};

const formSchema = z.object({
  seatCount: z.number()
    .min(1, "Please select at least 1 seat")
    .max(10, "Maximum 10 seats per booking"),
});

type FormData = z.infer<typeof formSchema>;

const BookingModal = ({ 
  isOpen, 
  onClose, 
  eventId, 
  eventTitle, 
  price, 
  maxSeats 
}: BookingModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seatCount: 1,
    },
  });

  const seatCount = form.watch("seatCount");
  const totalPrice = seatCount * price;

  const handleSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Please sign in to book tickets");
      onClose();
      navigate("/auth", { state: { returnTo: `/event/${eventId}` } });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        eventId,
        seatCount: data.seatCount,
        userId: user.id,
        totalAmount: totalPrice,
      });

      toast.success("Booking successful! Check your email for confirmation.");
      onClose();
      
      // Refresh the page to update available seats
      window.location.reload();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to complete booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementSeats = () => {
    const current = form.getValues("seatCount");
    if (current < Math.min(10, maxSeats)) {
      form.setValue("seatCount", current + 1);
    }
  };

  const decrementSeats = () => {
    const current = form.getValues("seatCount");
    if (current > 1) {
      form.setValue("seatCount", current - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Tickets</DialogTitle>
          <DialogDescription>
            Complete your booking for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="seatCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementSeats}
                      disabled={field.value <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        min={1}
                        max={Math.min(10, maxSeats)}
                        className="w-20 text-center"
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={incrementSeats}
                      disabled={field.value >= Math.min(10, maxSeats)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    {maxSeats} seats available (max 10 per booking)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <div className="flex justify-between font-medium mb-2">
                <span>Price per ticket:</span>
                <span>${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-entertainment-600 hover:bg-entertainment-700"
                disabled={isSubmitting}
              >
                <Ticket className="mr-2 h-4 w-4" />
                {isSubmitting ? "Processing..." : "Complete Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
