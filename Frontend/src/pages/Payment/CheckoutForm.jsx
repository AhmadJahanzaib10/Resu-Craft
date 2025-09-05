import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";
// import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

const CheckoutForm = ({
  modal_id,
  clientSecret,
  downloadPDF,
  savePDFToFirebase,
}) => {
  // console.log(clientSecret,"client Secret")
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  // const axios = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (!stripe) {
      return;
    }
    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
  if (!paymentIntent) {
    setMessage("Unable to retrieve payment intent.");
    return;
  }

  switch (paymentIntent.status) {
    case "succeeded":
      setMessage("Payment succeeded!");
      break;
    case "processing":
      setMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      setMessage("Your payment was not successful, please try again.");
      break;
    default:
      setMessage("Something went wrong.");
      break;
  }
});

  }, [stripe, clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment status: " + paymentIntent.status);
      console.log("bujsi");
      // try {
      //     // await axios.post("/payments/confirm-payment", { paymentIntentId: paymentIntent.id });
      //     navigate(`/dashboard`);
      //     // Swal.success('Payment successful')
      // } catch (err) {
      //     // console.log(err);
      //     toast.error(err)
      // }
      const modal = document.getElementById(modal_id);
      if (modal) modal.close();
      Swal.fire("Success");
      savePDFToFirebase();
      downloadPDF();
      window.location.reload();
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <Button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="w-full mt-4 bg-blue-900"
      >
        <span id="button-text">
          {isProcessing ? <Loader2 className="animate-spin" /> : "Pay now"}
        </span>
      </Button>
      {/* {message && <div id="payment-message">{message}</div>} */}
    </form>
  );
};

export default CheckoutForm;
