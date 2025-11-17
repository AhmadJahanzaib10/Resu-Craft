import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "../../assets/images/google.png";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import useAuth from "@/hooks/useAuth";
import Swal from "sweetalert2";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
});

const Login = () => {
  // const [error, setError] = useState("");
  const navigate = useNavigate();
   const { logInUser,signUpGoogleUser, user,loading, setLoading, checkAndExpireSubscription } = useAuth()



     //edited by developer
  // Check for auth state and redirect result when component mounts
  
  useEffect(() => {
    // Check if user is already logged in
      if (user) 
      navigate("/dashboard");
    
  }, [navigate]);

  

  //edited by developer
  const handleSubmit = async (values, { setSubmitting }) => {
    const { email, password } = values;
  
    try {
      // Wait for the login to complete
      const res = await logInUser(email, password);
      const user = res.user;

    // 2️⃣ Check and update subscription if expired
    const expired = await checkAndExpireSubscription(user.uid);

    // 3️⃣ Show alert depending on subscription status
    if (expired) {
      await Swal.fire({
        icon: "error",
        title: "Subscription Expired",
        text: "Your subscription has expired. Plan has been reset to Free.",
        confirmButtonColor: "#d33",
      });
    } else {
      await Swal.fire({
        position: "top",
        icon: "success",
        title: "Logged in successfully",
        showConfirmButton: false,
        timer: 1000,
      });
    }

    // 4️⃣ Navigate to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.log(error);

    // Handle Firebase error codes
    let message = "Something went wrong!";
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      message = "Incorrect email or password. Please try again.";
    }

    Swal.fire({
      title: message,
      icon: "error",
    });
  } finally {
    setSubmitting(false);
    setLoading(false);
  }
  };
  
  //edited by developer
  const loginWithGoogle = async () => {
    try {
      const { user, expired } = await signUpGoogleUser();
      if (expired) {
        // Subscription has expired → show alert
        await Swal.fire({
          icon: "error",
          title: "Subscription Expired",
          text: "Your subscription has expired. Please renew to access all features.",
          confirmButtonColor: "#d33",
        });
      } else {
        // Subscription active or free → show success
        await Swal.fire({
          position: "top",
          icon: "success",
          title: "Logged in successfully",
          showConfirmButton: false,
          timer: 1000,
        });
      }
  
      // Safe to redirect after alert
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Something went wrong.",
        confirmButtonColor: "#d33",
      });
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[100%] md:w-[50%] h-screen rounded-2xl px-6 flex justify-center flex-col">
        {/* <img src={mockLogo} alt="Logo" className="w-20 h-20 mx-auto" /> */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-primary font-outfit relative inline-block">
            Resume Shaper AI
            <svg className="absolute w-full" style={{ bottom: "-8px", left: "0" }} viewBox="0 0 200 8" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M 0 4 C 40 0, 60 8, 100 4 C 140 0, 160 8, 200 4" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-primary"
              />
            </svg>
          </h2>
          <p className="text-center text-gray-500 mt-4 text-sm">Your AI-powered resume assistant</p>
        </div>
        <h2 className="text-xl font-plight text-left mb-5 text-primary">Login</h2>
        
        {/* {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )} */}
        
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleSubmit }) => (
            <Form className="flex flex-col space-y-4">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered w-full text-black border mb-1 p-1.5"
                  disabled={loading || isSubmitting}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mb-2" />
              </div>
              
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="input input-bordered w-full text-black border mb-1 p-1.5"
                  disabled={loading || isSubmitting}
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mb-2" />
              </div>
              
              <button
                type="submit"
                className="w-full cursor-pointer bg-primary rounded-lg text-white p-2 mb-3"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Processing..." : "Login"}
              </button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mb-3">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full border cursor-pointer border-gray-200 p-2 rounded-lg flex flex-row items-center justify-center gap-2 hover:bg-gray-100"
                disabled={loading || isSubmitting}
              >
                <img src={googleIcon} alt="Google Logo" className="w-6 h-6" />
                <p className="text-gray-600 text-sm">Sign in with Google</p>
              </button>
            </Form>
          )}
        </Formik>
        
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary underline font-semibold transition"
          >
            Sign up here
          </Link>
        </p>
      </div>
      <div className="hidden md:block w-[50%] h-screen rounded-2xl">
      <video 
  className="w-[100%] h-[100%] object-cover"
  autoPlay
  muted
  loop
  playsInline
>
  <source src="https://res.cloudinary.com/dnl7fvz4m/video/upload/f_auto,q_auto/v1763394246/Art_tvxczl.mp4" type="video/mp4" />
</video>
      </div>
    </div>
  );
};

export default Login;