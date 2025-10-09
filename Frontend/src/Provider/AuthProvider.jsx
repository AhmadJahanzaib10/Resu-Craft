import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
// import useAxiosPublic from '../Hooks/useAxiosPublic';
import { auth } from '@/Firebase/firebase.config';

export const AuthContext = createContext()
const AuthProvider = ({ children }) => {
    // const axiosPublic = useAxiosPublic()
    const googleProvider = new GoogleAuthProvider();
    const [user, setUser] = useState([])
    const [loading, setLoading] = useState(true)

    const signUpUser =async (name,email, password) => {
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password)
        .then(()=>{
            updateProfile(auth.currentUser, {
            displayName: name
        })
        }
        )
    }
    const signUpGoogleUser = () => {
        setLoading(true)
        return signInWithPopup(auth, googleProvider)
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // if (currentUser) {
            //     const userInfo = { email: currentUser.email }
            //     axiosPublic.post('/jwt', userInfo)
            //         .then(res => {
            //             if (res.data.token) {
            //                 localStorage.setItem('access-token', res.data.token)
            //             }
            //         })
            // }
            // else {
            //     localStorage.removeItem('access-token')
            // }

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
    }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;