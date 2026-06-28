const express = require("express");
const cors = require("cors");
const admin = require('./firebase');
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const Stripe = require("stripe");


dotenv.config();
console.log("🔑 Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET);
console.log("🔑 Stripe Key:", process.env.STRIPE_API_SECRET_KEY ? "Loaded ✅" : "Missing ❌");
const app = express();
app.use(cors({ origin: "*" }));

const stripe = Stripe(process.env.STRIPE_API_SECRET_KEY);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  console.log("🚨 Webhook hit received");
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
      const subscriptionRef = db.ref(`subscriptions/${subscriptionId}`);

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

      console.log('subscriptionId:', subscriptionId);
      console.log('customerId:', customerId);
      console.log('userId:', userId);

      const subscriptionData = {
        plan: planName,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        cancelAt: null, 
      };

      // Run both writes concurrently
      await Promise.all([
        userRef.set(subscriptionData),
        subscriptionRef.set({          // write to subscriptions table
          ...subscriptionData,
          userId,                      // link back to the user
          createdAt: new Date().toISOString(),
        }),
      ]);


      console.log(`🔥 User ${userId} subscription updated in Firebase.`);
    } catch (error) {
      console.error('❌ Firebase update failed:', error);
    }
  }
  else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    // find user by stripeCustomerId in Firebase
    const db = admin.database();
    const usersRef = db.ref("users");
    const snapshot = await usersRef.once("value");

    snapshot.forEach((userSnap) => {
      const sub = userSnap.val().subscription;
      if (sub && sub.stripeCustomerId === customerId) {
        userSnap.ref.child("subscription").update({ status: "canceled" });
      }
    });

    console.log(`🛑 Subscription canceled via webhook for customer ${customerId}`);
  }
  else {
    console.log(`Unhandled event type ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use(express.json());

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
    console.log("Local Session Route Hit")
    console.log("📦 priceId:", priceId);
  console.log("👤 userId:", userId);
  console.log("📋 planName:", planName);


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
      success_url: "https://resu-craft-dun.vercel.app/success",
      cancel_url: "https://resu-craft-dun.vercel.app/cancel",
      metadata: {
        userId,
        planName,
      },
    });

    console.log("✅ Session created:", session.id);
  console.log("🔗 Session URL:", session.url);
  console.log("📋 Session metadata:", session.metadata);
  console.log("🔄 Session mode:", session.mode);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/cancel-subscription", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const db = admin.database();
    const userRef = db.ref(`users/${userId}/subscription`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const { stripeSubscriptionId } = snapshot.val();
    if (!stripeSubscriptionId) {
      return res.status(400).json({ error: "No Stripe subscription ID found" });
    }

    const canceledSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    const cancelFields = {
      status: "canceled",
      cancelAt: canceledSubscription.cancel_at,
    };

    // 👇 update both tables
    await Promise.all([
      userRef.update(cancelFields),
      db.ref(`subscriptions/${stripeSubscriptionId}`).update(cancelFields), // 👈 sync subscriptions table
    ]);

    console.log(`🛑 Subscription canceled for user: ${userId}`);
    res.json({ success: true, canceledSubscription });
  } catch (error) {
    console.error("❌ Cancel subscription error:", error);
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
