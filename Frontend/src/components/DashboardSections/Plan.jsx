import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Calendar, Shield, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import {ref , onValue } from "firebase/database";
import { db } from '@/Firebase/firebase.config';
import useAuth from "@/hooks/useAuth";
import '../../plan.css';

export default function Plan() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

   // Fetch user data from Firebase Realtime Database
   useEffect(() => {
    const userId = user.uid; // Replace with actual logged-in user ID
    const userRef = ref(db, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentSubscription(snapshot.val());
      } else {
        setCurrentSubscription(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '8.99',
      period: 'week',
      stripePriceId: 'price_1SIE4RLlctx6KinRMc3yODk3',
      icon: Calendar,
      description: 'Perfect for trying out'
    },
    {
      id: 'biweekly',
      name: 'Bi-Weekly',
      price: '14.99',
      period: '2 weeks',
      stripePriceId: 'price_1SIE5sLlctx6KinRl7rQtJim',
      icon: Zap,
      description: 'Most popular choice',
      badge: 'Popular',
      savings: '10%'
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '19.99',
      period: 'month',
      stripePriceId: 'price_1SIE6WLlctx6KinRkzVIF99p',
      icon: Crown,
      description: 'Best value for money',
      badge: 'Best Value',
      savings: '25%'
    }
  ];

  const handleSubscribe = async (plan) => {
    setLoadingPlan(plan.id);
    const VITE_Stripe_Backend_Api = import.meta.env.VITE_Stripe_Backend_Api;
    try {
      const response = await fetch(`${VITE_Stripe_Backend_Api}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.uid,
          planName: plan.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
        setLoadingPlan(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // prevent crash if null/undefined
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCurrentPlan = (planName) => {
    if (!currentSubscription || !currentSubscription.subscription) return false;
  
    const currentPlan = currentSubscription.subscription.plan;
    if (!currentPlan) return false;
  
    return currentPlan.toLowerCase() === planName.toLowerCase();
  };

  return (
    <div className="min-h-screen flex items-center bg-white md:bg-gradient-to-br md:from-gray-50 md:to-gray-100 py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2" style={{ borderColor: '#24356e' }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: '#24356e' }}>
                    <CheckCircle2 size={24} color="white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#24356e' }}>
                      Current Subscription
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentSubscription.subscription.plan} Plan
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Paid Date</p>
                      <p className="text-sm font-semibold" style={{ color: '#24356e' }}>
                        {currentSubscription.subscription.startDate ? formatDate(currentSubscription.subscription.startDate) : "Not Subscribed"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className="text-sm font-semibold" style={{ color: '#24356e' }}>
                      {currentSubscription.subscription.endDate ? formatDate(currentSubscription.subscription.endDate) : "Not Subscribed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" 
               style={{ backgroundColor: '#24356e' }}>
            <Crown size={40} color="white" />
          </div>
          <h1 className="md:text-5xl text-4xl font-bold mb-4" style={{ color: '#24356e' }}>
            Choose Your Plan
          </h1>
          <p className="md:text-xl text-[16px] text-gray-600">Flexible billing options to match your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isSubscribed = isCurrentPlan(plan.name);
            const isLoading = loadingPlan === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-2xl transition-all duration-300 ${
                  isSubscribed 
                    ? 'shadow-2xl scale-105 cursor-default' 
                    : isSelected 
                    ? 'shadow-2xl scale-105 cursor-pointer' 
                    : 'shadow-lg hover:-translate-y-2 cursor-pointer'
                }`}
                style={{ 
                  border: isSelected ? '3px solid #24356e' : '1px solid #e5e7eb'
                }}
                onClick={() => !isSubscribed && setSelectedPlan(plan.id)}
              >
            
                {plan.badge && !isSubscribed && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-2 rounded-lg text-xs font-semibold tracking-wide text-white"
                          style={{ backgroundColor: '#24356e' }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-2 bg-green-500 rounded-lg text-xs font-bold text-white save-txt">
                      Save {plan.savings}
                    </span>
                  </div>
                )}
                
                <div className="p-8 flex flex-col h-full">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300 ${
                      isSelected || isSubscribed ? '' : 'bg-gray-100'
                    }`}
                    style={{ backgroundColor: (isSelected || isSubscribed) ? '#24356e' : undefined }}>
                      <IconComponent size={32} color={(isSelected || isSubscribed) ? 'white' : '#24356e'} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#24356e' }}>
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl text-gray-500">$</span>
                      <span className="text-6xl font-bold" style={{ color: '#24356e' }}>
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-gray-500">per {plan.period}</span>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check size={18} style={{ color: '#24356e' }} strokeWidth={3} />
                      <span className="text-sm">AI Resume Builder</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check size={18} style={{ color: '#24356e' }} strokeWidth={3} />
                      <span className="text-sm">Cover Letter Generator</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check size={18} style={{ color: '#24356e' }} strokeWidth={3} />
                      <span className="text-sm">ATS-Friendly Templates</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check size={18} style={{ color: '#24356e' }} strokeWidth={3} />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>

                  <button
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 mt-auto ${
                      isSubscribed
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : isSelected 
                        ? 'text-white shadow-lg' 
                        : 'bg-white text-[#24356e] hover:text-white'
                    }`}
                    style={{
                      backgroundColor: isSubscribed ? undefined : (isSelected ? '#24356e' : undefined),
                      border: isSubscribed ? '2px solid #e5e7eb' : '2px solid #24356e'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isLoading && !isSubscribed) {
                        e.currentTarget.style.backgroundColor = '#24356e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isLoading && !isSubscribed) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSubscribed) {
                        handleSubscribe(plan);
                      }
                    }}
                    disabled={isLoading  || isSubscribed}
                  >
                    {isSubscribed ? (
                      <span className="flex items-center justify-center">
                        <CheckCircle2 size={20} className="mr-2" />
                        Subscribed
                      </span>
                    ) : isLoading  ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        {isSelected && <Check size={20} className="mr-2" />}
                        Get Started
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2 flex items-center justify-center">
            <Shield size={16} className="mr-2" />
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}