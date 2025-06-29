import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe(
  "pk_test_51RdxPq2V6cib4Vuzmpw1kEolPpkhuto84Nwhai561oyV7YiAK3creR2oezQhYustdscfLCoIlSrgIHIeixQt8AkH00Xq7ahJQV"
);

export const bookTour = async (tourId) => {
  try {
    // 1- Get checkout session from out API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2- Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
