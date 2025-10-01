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
   const { logInUser,signUpGoogleUser, user,loading } = useAuth()



     //edited by developer
  // Check for auth state and redirect result when component mounts
  
  useEffect(() => {
    // Check if user is already logged in
      if (user) 
      navigate("/dashboard");
    
  }, [navigate]);


  //edited by developer
  const handleSubmit = async (values, { setSubmitting }) => {
    const {email,password}=values;
    try {
      logInUser(email, password)
            .then((res) => {
                console.log(res)
                Swal.fire({
                    title: "Logged in",
                    icon: "success",
                });
                navigate("/dashboard");
            })
            .catch(error => console.log(error))
     
    } finally {
      
      setSubmitting(false);
    }
  };
  //edited by developer
  const loginWithGoogle = async () => {
    signUpGoogleUser()
            .then(res => {
                Swal.fire({
                    position: "top",
                    icon: "success",
                    title: "Logged in succesfully",
                    showConfirmButton: false,
                    timer: 1000
                });

                navigate("/dashboard")
            }
            )
            .catch(err => console.log(err))
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl">
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
    </div>
  );
};

export default Login;