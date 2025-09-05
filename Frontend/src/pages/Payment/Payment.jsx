import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(`${import.meta.env.VITE_payment_gateway_key}`);
const Payment = ({ downloadPDF, savePDFToFirebase, modal_id }) => {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const createPayment = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_Stripe_Backend_Api}/create-payment-intent`,
          { price: 8.99 }
        );
        setClientSecret(response.data.clientSecret);
        setPaymentStatus(null); // Reset status on new intent creation
      } catch (error) {
        console.error("Error creating payment intent:", error);
        setPaymentStatus("error");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      createPayment();
    } else {
      setPaymentStatus("missing_info");
      setLoading(false);
    }
  }, [user]);
  return (
    <div>
      

      <div className="space-y-6">
        <Card className="border-blue-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">
              Resume Price: $8.99
            </CardTitle>
            <CardDescription>
              Get your professionally designed resume for only{" "}
              <span className="font-semibold text-blue-900">$8.99</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Status Alerts */}
            {paymentStatus === "error" && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load payment. Please try again.
                </AlertDescription>
              </Alert>
            )}
            {paymentStatus === "missing_info" && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Missing booking information. Please go back and select a
                  package.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                <span className="ml-2 text-gray-600">Loading payment...</span>
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: "stripe" } }}
              >
                <CheckoutForm
                  modal_id={modal_id}
                  clientSecret={clientSecret}
                  downloadPDF={downloadPDF}
                  savePDFToFirebase={savePDFToFirebase}
                />
              </Elements>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Could not load payment form. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
