const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const admin = require('./firebase');
const stripe = require('stripe')(process.env.STRIPE_API_SECRET_KEY)
const port = process.env.PORT || 5000;

app.use(cors())

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_88091233e03324b0720e83fa29fdd223f1be85247ea16403c608adaf0d797363";

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

   // ✅ Handle successful payment
   if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId; // we sent this from frontend
    const subscriptionId = session.subscription;
    const planName = session.metadata.plan; 
    const customerId = session.customer;

    console.log(`✅ Payment success for user: ${userId}`);

    try {
      // Reference to your Realtime Database
      const db = admin.database();
      const userRef = db.ref(`users/${userId}/subscription`);

        // Update subscription info according to your schema
        await userRef.update({
          plan: planName, // optional fallback
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: null,
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



app.use(express.json())

async function run() {
    try {







     // payment gateway intent

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
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
            metadata: {
                userId: userId, // send from frontend
                plan: planName,
            },
          });
      
          res.json({ url: session.url });
        } catch (error) {
          console.error("Stripe Checkout Error:", error);
          res.status(500).json({ error: error.message });
        }
      });


        // jwt token related api 

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({token})
        })




    } finally {

    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Running successfully")
})
app.listen(port, () => {
    console.log(`Sitting on port ${port}`)
})