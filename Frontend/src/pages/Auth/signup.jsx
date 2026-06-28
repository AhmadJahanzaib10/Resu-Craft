import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import mockLogo from "../../assets/images/mockLogo.png";
import googleIcon from "../../assets/images/google.png";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAuth from "@/hooks/useAuth";
import Swal from "sweetalert2";

// Validation schema
const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signUpUser, signUpGoogleUser, user, loading } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    const { name, email, password } = values;

    try {
      const result = await signUpUser(name, email, password);

      if (result.needsVerification) {
        Swal.fire({
          title: "Check Your Email to Verify Your Account",
          text: "We sent you a verification link.",
          icon: "success",
        });

        navigate("/verify-email");
        return;
      }
    } catch (error) {
      console.log("Signup error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const signupWithGoogle = async () => {
    signUpGoogleUser()
      .then((res) => {
        console.log(res);
        Swal.fire({
          position: "top",
          icon: "success",
          title: "Logged in successfully",
          showConfirmButton: false,
          timer: 1000,
        });

        navigate("/dashboard");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-primary font-outfit relative inline-block">
            Resu Craft
            <svg
              className="absolute w-full"
              style={{ bottom: "-8px", left: "0" }}
              viewBox="0 0 200 8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 4 C 40 0, 60 8, 100 4 C 140 0, 160 8, 200 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              />
            </svg>
          </h2>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Your AI-powered resume assistant
          </p>
        </div>
        <h2 className="text-xl font-plight text-left mb-5 text-primary">
          Create an Account
        </h2>

        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col space-y-4">
              <div>
                <Field
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="input input-bordered w-full text-black border mb-1 p-1.5"
                  disabled={loading || isSubmitting}
                />
              </div>

              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered w-full text-black border mb-1 p-1.5"
                  disabled={loading || isSubmitting}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mb-2"
                />
              </div>

              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="input input-bordered w-full text-black border mb-1 p-1.5"
                  disabled={loading || isSubmitting}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mb-2"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer bg-primary rounded-lg text-white p-2 mb-3"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Processing..." : "Signup"}
              </button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mb-3">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={signupWithGoogle}
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary underline font-semibold transition"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;