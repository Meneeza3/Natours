import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe(
  "pk_test_51RdxPq2V6cib4Vuzmpw1kEolPpkhuto84Nwhai561oyV7YiAK3creR2oezQhYustdscfLCoIlSrgIHIeixQt8AkH00Xq7ahJQV"
);

export const bookTour = async (tourId) => {
  try {
    // 1- Get checkout session from out API
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    console.log(session.data.session.id);
    // 2- Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
