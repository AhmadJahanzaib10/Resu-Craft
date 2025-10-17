import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import { ref, get, set, update } from "firebase/database";
// import useAxiosPublic from '../Hooks/useAxiosPublic';
import { auth } from '@/Firebase/firebase.config';
import { db } from "@/Firebase/firebase.config";
import Swal from 'sweetalert2';

export const AuthContext = createContext()
const AuthProvider = ({ children }) => {
    // const axiosPublic = useAxiosPublic()
    const googleProvider = new GoogleAuthProvider();
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);

    const checkAndExpireSubscription = async (userId) => {
        try {
          const userRef = ref(db, `users/${userId}`);
          const snapshot = await get(userRef);
      
          if (!snapshot.exists()) {
            console.log(`No user found for ${userId}`);
            return false;
          }
      
          const userData = snapshot.val();
          const sub = userData.subscription;
          console.log(sub)
      
          if (!sub) return false;
      
          // If subscription is active but endDate passed
          if (
            sub.status === "active" &&
            sub.endDate &&
            new Date(sub.endDate) <= new Date()
          ) {
            await update(userRef, {
              subscription: {
                plan: "Free",
                status: "inactive",
                startDate: null,
                endDate: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
              },
            });
      
            console.log(`User ${userId} subscription expired and reset to Free.`);
            return true; // subscription was expired
          }
      
          return false; // subscription still valid
        } catch (error) {
          console.error("Error updating subscription status:", error);
          return false;
        }
      };

    const ensureUserData = async (firebaseUser) => {
        if (!firebaseUser) return;
        console.log(firebaseUser)

        try {
            const userRef = ref(db, `users/${firebaseUser.uid}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                await set(userRef, {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || "",
                    createdAt: new Date().toISOString(),
                    subscription: {
                        plan: "Free",
                        status: "inactive",
                        startDate: null,
                        endDate: null,
                        stripeCustomerId: null,
                        stripeSubscriptionId: null,
                    },
                });
                console.log("✅ RTDB user created:", firebaseUser.email);
            } else {
                console.log("✅ RTDB user exists:", firebaseUser.email);
            }
        } catch (error) {
            console.error("❌ RTDB ensure user failed:", error);
        }
    };

    const signUpUser = async (name, email, password) => {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        await ensureUserData(user);

        return user;
    }
    const signUpGoogleUser = async () => {
        setLoading(true);
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        await ensureUserData(user);
         // ✅ Check and update expired subscription
        const expired = await checkAndExpireSubscription(user.uid);
        return {user, expired};

    }
    const logInUser = (email, password) => {
        setLoading(true)
        return signInWithEmailAndPassword(auth, email, password)
    }
    // const updateUser = (name, photo) => {
    //     setLoading(true)
    //     console.log("auth user", auth.currentUser)
    //     return updateProfile(auth.currentUser, {
    //         displayName: name,
    //         photoURL: photo
    //     })
    // }
    const signOutUser = () => {
        setLoading(true)
        return signOut(auth)
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                console.log("Auth state changed:", currentUser.email);
                // Wait 1 second before Firestore call
                setTimeout(() => ensureUserData(currentUser), 1000);

                setUser(currentUser);
            } else {
                setUser(null);
            }

            setLoading(false)
        })
        return () => {
            unsubscribe()
        }
    }, [])
    const authInfo = {
        user,
        loading,
        signUpUser,
        logInUser,
        signOutUser,
        signUpGoogleUser,
        setLoading,
        checkAndExpireSubscription
    }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;