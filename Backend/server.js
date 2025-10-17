const express = require("express");
const cors = require("cors");
const admin = require('./firebase');
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const Stripe = require("stripe");


dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(`📩 Stripe Event: ${event.type}`);

   // ✅ Handle successful payment
   if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {}; // ensure it exists

      const userId = metadata.userId; // from frontend
      const planName = metadata.planName;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

    console.log(`✅ Payment success for user: ${userId}`);

    try {
      // Reference to your Realtime Database
      const db = admin.database();
      const userRef = db.ref(`users/${userId}/subscription`);

      // Determine endDate based on planName
const startDate = new Date();
let endDate = new Date(startDate);

if (planName.toLowerCase() === 'weekly') {
  endDate.setDate(startDate.getDate() + 7);
} else if (planName.toLowerCase() === 'bi-weekly') {
  endDate.setDate(startDate.getDate() + 14);
} else if (planName.toLowerCase() === 'monthly') {
  endDate.setMonth(startDate.getMonth() + 1);
} else {
  // Default fallback (e.g., 1 week)
  endDate.setDate(startDate.getDate() + 7);
}

        // Update subscription info according to your schema
        await userRef.update({
          plan: planName, // optional fallback
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });


      console.log(`🔥 User ${userId} subscription updated in Firebase.`);
    } catch (error) {
      console.error('❌ Firebase update failed:', error);
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use(express.json());

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_API_SECRET_KEY);

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Resume Builder API",
      version: "1.0.0",
      description: "API Documentation for Resume Builder Authentication",
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.get("/", (req, res) => {
  res.send("Running successfully");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId, userId, planName } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Stripe price ID from your dashboard
          quantity: 1,
        },
      ],
      success_url: "https://app.resumeshaperai.com/success",
      cancel_url: "https://app.resumeshaperai.com/cancel",
      metadata: {
        userId,
        planName,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Payment Intent Route
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { price } = req.body;

    if (!price) {
      return res.status(400).send({ error: "Price is required" });
    }

    const amount = parseInt(price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
