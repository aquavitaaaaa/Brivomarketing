// Conversion / booking configuration.
//
// BOOKING_URL: paste a Calendly (or any scheduler) link here to enable the
// "Book a 15-min call" fast-path in the inquiry flow + mobile CTA bar.
// Leave it as an empty string to gracefully hide the booking option and keep
// the email-brief flow only.
export const BOOKING_URL = "";

export const hasBooking = () =>
  typeof BOOKING_URL === "string" && BOOKING_URL.trim().length > 0;
