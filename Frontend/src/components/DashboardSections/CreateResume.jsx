import React, { useState, useEffect, useRef } from "react";
import * as yup from "yup";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, get, update } from "firebase/database";
import { db } from "@/Firebase/firebase.config";
import Swal from "sweetalert2";
// import { auth } from "../../firebase"; // adjust the path to your firebase config file
import { Plus, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

import { generateTemplate2PDF } from "./ResumeTemplates/Template2";
import { generateTemplate3PDF } from "./ResumeTemplates/Template3";
import { generateTemplate4PDF } from "./ResumeTemplates/Template4";
import { generateTemplate5PDF } from "./ResumeTemplates/Template5";
import { generateTemplate6PDF } from "./ResumeTemplates/Template6";
import { generateTemplate7PDF } from "./ResumeTemplates/Template7";
import { generateTemplate8PDF } from "./ResumeTemplates/Template8";

import temp2 from "../../assets/images/temp2.webp";
import temp3 from "../../assets/images/temp3.webp";
import temp4 from "../../assets/images/temp5.webp";
import temp5 from "../../assets/images/temp.webp";
import temp6 from "../../assets/images/temp6.webp";
import temp7 from "../../assets/images/temp7.webp";
import temp8 from "../../assets/images/temp8.webp";

import ModernInput from "../ModernInput";
import useAuth from "@/hooks/useAuth";
import PDFPreview from "./PDFPreview";
import CheckoutForm from "@/pages/Payment/CheckoutForm";
import Payment from "@/pages/Payment/Payment";

// Yup schema for Personal Information (Step 1)
const personalInfoSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^\+?[0-9\s\-().]{7,}$/, "Invalid phone number"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  // linkedIn: yup
  //   .string()
  //   .required("LinkedIn URL is required"),
  // .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+$/, "Invalid LinkedIn URL"),
});

const ResumeBuilder = () => {
  const { user } = useAuth();
  // We now have 8 steps (Step 5 is for Additional Content)
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  // Field-level errors for personal info validations
  const [fieldErrors, setFieldErrors] = useState({});
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");

  // Temporary inputs for stackable fields
  const [currentSkill, setCurrentSkill] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  // New temporary states for reference: name and contact
  const [currentReferenceName, setCurrentReferenceName] = useState("");
  const [currentReferenceContact, setCurrentReferenceContact] = useState("");

  // For the modal that shows the AI vs. existing data
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  // Store the AI-optimized data from Gemini
  const [aiResume, setAiResume] = useState(null);
  // A copy that the user can edit on the right side
  const [editableAiResume, setEditableAiResume] = useState(null);

  const [pdfSaved, setPdfSaved] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState("");
  const [savingPDF, setSavingPDF] = useState(false);

  const [pdfBlob, setPdfBlob] = useState(null);
  // Check if it's mobile screen (Fixing the bottom next and prev buttons for step 6)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (aiResume) {
      // When we get new AI data, make a copy for editing
      setEditableAiResume(structuredClone(aiResume));
      // or use JSON.parse(JSON.stringify(aiResume)) if needed
    }
  }, [aiResume]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const templateImages = {
    template2: temp2,
    template3: temp3,
    template4: temp4,
    template5: temp5,
    template6: temp6,
    template7: temp7,
    template8: temp8,
  };

  // Updated state with separate fields for phone, email, address and stackable fields.
  // Note: additionalContent.references will now be an array of objects { name, contact }.
  const [resume, setResume] = useState({
    // Step 1: Personal Information
    name: "",
    phone: "",
    email: "",
    address: "",
    // linkedIn: "",
    photo: "",
    // Step 2: Work Experience (multiple entries)
    workExperience: [
      {
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    // Step 3: Education (multiple entries)
    education: [{ school: "", degree: "", graduationYear: "" }],
    // Step 4: Skills & Summary
    skills: [], // array of skills (max 5)
    summary: "",
    // Step 5: Additional Content (optional stackable fields)
    additionalContent: {
      languages: [],
      references: [], // now an array of objects { name, contact }
    },
    // Step 6: Template Selection
    template: "template2",
    // Step 7: AI Optimization
    optimized: false,
  });

  // Handler for file input change
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result);
        // Optionally update resume with the photo data URL:
        setResume((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelPhoto = () => {
    setPhotoDataUrl("");
    setPhotoFileName("");
    // Also clear file input if needed (if using ref)
  };

  // ------------------------
  // Validate current step using Yup (example for Step 1)
  const validateCurrentStep = async () => {
    if (step === 1) {
      try {
        await personalInfoSchema.validate(
          {
            name: resume.name,
            phone: resume.phone,
            email: resume.email,
            address: resume.address,
            // linkedIn: resume.linkedIn,
          },
          { abortEarly: false }
        );
        setFieldErrors({});
        return true;
      } catch (err) {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setFieldErrors(errors);
        return false;
      }
    }
    // For other steps, you might use your existing logic.
    return true;
  };

  // ------------------------
  // Navigation Handlers
  // ------------------------
  const nextStep = async () => {
    const valid = await validateCurrentStep();
    if (valid) {
      setErrorMessage("");
      setStep((prev) => Math.min(prev + 1, 8));
    } else {
      setErrorMessage("Some fields are invalid. Please fix the errors.");
    }
  };

  const prevStep = () => {
    setErrorMessage("");
    setFieldErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // ------------------------
  // Reordering Functions for Work Experience / Education
  // ------------------------
  const moveWorkExpUp = (index) => {
    if (index === 0) return;
    const newWorkExp = [...resume.workExperience];
    [newWorkExp[index - 1], newWorkExp[index]] = [
      newWorkExp[index],
      newWorkExp[index - 1],
    ];
    setResume({ ...resume, workExperience: newWorkExp });
  };

  const moveWorkExpDown = (index) => {
    if (index === resume.workExperience.length - 1) return;
    const newWorkExp = [...resume.workExperience];
    [newWorkExp[index + 1], newWorkExp[index]] = [
      newWorkExp[index],
      newWorkExp[index + 1],
    ];
    setResume({ ...resume, workExperience: newWorkExp });
  };

  const moveEduUp = (index) => {
    if (index === 0) return;
    const newEdu = [...resume.education];
    [newEdu[index - 1], newEdu[index]] = [newEdu[index], newEdu[index - 1]];
    setResume({ ...resume, education: newEdu });
  };

  const moveEduDown = (index) => {
    if (index === resume.education.length - 1) return;
    const newEdu = [...resume.education];
    [newEdu[index + 1], newEdu[index]] = [newEdu[index], newEdu[index + 1]];
    setResume({ ...resume, education: newEdu });
  };

  const generateSuggestions = async () => {
    setLoading(true);
    setErrorMessage("");

    const prompt = `
      Given the following resume details:
      Name: ${resume.name}
      Work Experience: ${JSON.stringify(resume.workExperience)}
      Education: ${JSON.stringify(resume.education)}
      Additional Content: ${JSON.stringify(resume.additionalContent)}
      
      Please output a valid JSON object with exactly two keys:
        "summary" - a concise, professional summary for the candidate.
        "skills" - an array of up to 5 key skills.
      Do not include any markdown or code block formatting in your output.
      Following is a sample response:
      {
        "summary": "A highly skilled professional with a background in software engineering and project management.",
        "skills": ["JavaScript", "React", "Node.js", "Agile Methodologies", "Project Management"]
      }
    `;
    console.log(import.meta.env.VITE_GEMINI_API_KEY)
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const result = await model.generateContent(prompt);

      // Access text from result.response.candidates[0].content.parts[0].text
      let responseText =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      responseText = responseText.trim();

      if (!responseText) {
        throw new Error("Gemini returned an empty text field.");
      }

      // In case the response is wrapped in triple backticks, remove them.
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/```json|```/g, "").trim();
      }

      const geminiOutput = JSON.parse(responseText);

      // Update resume state with Gemini output
      setResume((prev) => ({
        ...prev,
        summary: geminiOutput.summary || prev.summary,
        skills: geminiOutput.skills || prev.skills,
      }));
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setErrorMessage("Failed to generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dummy AI optimization for Step 7
  const optimizeResume = async () => {
    setLoading(true);
    setErrorMessage("");

    // Create a base resume with the user's existing data
    const baseResume = { ...resume };

    // If resume fields are empty, add placeholder data for better AI generation
    if (!baseResume.name) baseResume.name = "John Smith";

    // If work experience is empty or has no content, add a sample position
    if (
      baseResume.workExperience.length === 0 ||
      (baseResume.workExperience.length === 1 &&
        !baseResume.workExperience[0].jobTitle &&
        !baseResume.workExperience[0].company)
    ) {
      baseResume.workExperience = [
        {
          jobTitle: "Entry-Level Position",
          company: "Company Name",
          startDate: "2023",
          endDate: "Present",
          responsibilities: "Seeking first professional role",
        },
      ];
    }

    // If education is empty or has no content, add a sample education
    if (
      baseResume.education.length === 0 ||
      (baseResume.education.length === 1 &&
        !baseResume.education[0].school &&
        !baseResume.education[0].degree)
    ) {
      baseResume.education = [
        {
          school: "University Name",
          degree: "Bachelor's Degree",
          graduationYear: "2023",
        },
      ];
    }

    // Optimized prompt instructing Gemini to rework the entire resume.
    const prompt = `
      You are an expert resume optimizer.
      Given the following resume details:
      - Name: ${baseResume.name}
      - Work Experience: ${JSON.stringify(
      baseResume.workExperience.map((exp) => ({
        ...exp,
        // Combine start and end dates for the prompt
        duration: `${exp.startDate} - ${exp.endDate}`,
      }))
    )}
      - Education: ${JSON.stringify(baseResume.education)}
      - Additional Content: ${JSON.stringify(baseResume.additionalContent)}
      - Current Summary: ${baseResume.summary || "No summary provided"}
      - Current Skills: ${JSON.stringify(
      baseResume.skills.length > 0
        ? baseResume.skills
        : ["No skills provided"]
    )}
      
      Please optimize and create a complete resume.
      Return a valid JSON object with exactly four keys:
        "summary": A concise, professional summary that highlights the candidate's strengths and achievements.
        "skills": An array of 5 key skills relevant to their background or desired position.
        "workExperience": An array of work experience entries with detailed responsibilities for each job. If they're entry-level, create suitable starter positions with realistic responsibilities.
        "education": An array of education entries with schools and degrees. Convert abbreviations to extended format (e.g., BSc IT to BSc in Information Technology).
      
      Do not include any markdown or extra text.
      
      Example output format:
      {
        "summary": "A highly skilled professional with expertise in software development and project management.",
        "skills": ["JavaScript", "React", "Node.js", "Agile", "Leadership"],
        "workExperience": [
          {
            "jobTitle": "Senior Software Engineer",
            "company": "Google",
            "duration": "2018 - Present",
            "responsibilities": [
              "Led a team of engineers to build innovative products.",
              "Developed scalable applications.",
              "Managed project budgets.",
              "Mentored new hires.",
              "Improved code quality."
            ]
          }
        ],
        "education": [
          { "school": "Stanford University", "degree": "Bachelor of Science in Computer Science", "graduationYear": "2015" }
        ]
      }
    `;
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const result = await model.generateContent(prompt);

      // Access the response text from result.response.candidates[0].content.parts[0].text
      let responseText =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      responseText = responseText.trim();

      if (!responseText) {
        throw new Error("Gemini returned an empty text field.");
      }

      // In case the response is wrapped in triple backticks, remove them.
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/```json|```/g, "").trim();
      }

      const geminiOutput = JSON.parse(responseText);
      const responsibiltiesString = geminiOutput.workExperience[0].responsibilities.join("\n")
      geminiOutput.workExperience[0].responsibilities = responsibiltiesString;

      // Update the resume state with the optimized values from Gemini
      // setResume((prev) => ({
      //   ...prev,
      //   summary: geminiOutput.summary || prev.summary,
      //   skills: geminiOutput.skills || prev.skills,
      //   workExperience: geminiOutput.workExperience || prev.workExperience,
      //   education: geminiOutput.education || prev.education,
      // }));
      setAiResume(geminiOutput);
      setShowOptimizeModal(true);
    } catch (error) {
      console.error("Error optimizing resume:", error);
      setErrorMessage("Failed to optimize resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Re-Optimize calls optimizeResume again
  const handleReOptimize = async () => {
    setShowOptimizeModal(false);
    await optimizeResume();
  };

  // Update: merges AI data into main resume, closes modal, goes to next step
  const handleUpdateAiResume = () => {
    // When updating from AI data, we need to split the duration back into start and end dates
    const processedWorkExperience = editableAiResume.workExperience.map(
      (exp) => {
        // If the AI returns a combined duration field, split it
        if (exp.duration && !exp.startDate && !exp.endDate) {
          const [startDate, endDate] = exp.duration.split(" - ");
          return {
            ...exp,
            startDate: startDate || "",
            endDate: endDate || "",
          };
        }
        return exp;
      }
    );

    // Process skills - ensure it's always an array when saving to main resume
    let processedSkills = editableAiResume.skills;
    if (typeof processedSkills === "string") {
      // Split by comma and trim whitespace, then filter out any empty items
      processedSkills = processedSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else if (!Array.isArray(processedSkills)) {
      // Default to empty array if it's neither string nor array
      processedSkills = [];
    }

    setResume((prev) => ({
      ...prev,
      summary: editableAiResume.summary || prev.summary,
      skills: processedSkills || prev.skills,
      workExperience: processedWorkExperience || prev.workExperience,
      education: editableAiResume.education || prev.education,
    }));
    setShowOptimizeModal(false);
    setStep(8);
  };

  // Check before Downloading if user has subscription
  const handleDownload = async () => {
    try {
      // 2️⃣ Get user subscription data from Realtime DB
      const userRef = dbRef(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await Swal.fire({
          icon: "warning",
          title: "No Subscription Found",
          text: "Please subscribe first to download the PDF.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const subscription = snapshot.val();
      const sub = subscription.subscription; // shorthand

      if (!sub || !sub.startDate || !sub.endDate || sub.status !== "active") {
        // No subscription or invalid
        await Swal.fire({
          icon: "warning",
          title: "No Subscription Found",
          text: "Please subscribe first to download the PDF.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      // Check if subscription expired
      if (new Date(sub.endDate) <= new Date()) {
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
        await Swal.fire({
          icon: "error",
          title: "Subscription Expired",
          text: "Your subscription has expired. Please renew to continue.",
          confirmButtonColor: "#d33",
        });
        return;
      }
      downloadPDF();
    } catch (error) {
      console.error("Error verifying subscription:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not verify your subscription. Please try again later.",
        confirmButtonColor: "#d33",
      });
    }
  }


  // ------------------------
  // PDF Creation with Fixed Section Heights & Section Breaks
  // ------------------------
  const createPDFDocument = () => {
    let doc;
    switch (resume.template) {
      case "template2":
        doc = generateTemplate2PDF(resume);
        break;
      case "template3":
        doc = generateTemplate3PDF(resume);
        break;
      case "template4":
        doc = generateTemplate4PDF(resume);
        break;
      case "template5":
        doc = generateTemplate5PDF(resume);
        break;
      case "template6":
        doc = generateTemplate6PDF(resume);
        break;
      case "template7":
        doc = generateTemplate7PDF(resume);
        break;
      case "template8":
        doc = generateTemplate8PDF(resume);
        break;
      // add more cases as needed
      default:
        doc = generateTemplate2PDF(resume);
    }
    return doc;
  };

  // ------------------------
  // PDF Preview and Export
  // ------------------------
  const generatePDFPreview = () => {
    const doc = createPDFDocument();
    const pdfBlob = doc.output("blob"); // gives a real Blob
    setPdfBlob(pdfBlob); // keep Blob in state
  };

  // Download the PDF locally
  const downloadPDF = () => {
    const doc = createPDFDocument();
    doc.save("resume.pdf");
  };

  // ------------------------
  // Save PDF to Firebase (with confirmation and "already saved" check)
  // ------------------------
  const savePDFToFirebase = async () => {
    // If already saved, do not save again.
    if (pdfSaved) {
      setSaveConfirmation("PDF is already saved.");
      setTimeout(() => setSaveConfirmation(""), 5000);
      return;
    }

    setSavingPDF(true); // Set loading state to true when starting the save operation

    const doc = createPDFDocument();
    const pdfBlob = doc.output("blob");

    if (!user) {
      console.error("User is not logged in");
      setSavingPDF(false); // Reset loading state if user is not logged in
      return;
    }
    const uid = user.uid;
    const fileName = `resumes/${uid}/resume_${Date.now()}.pdf`;
    const storageInstance = getStorage();
    const storageRef = ref(storageInstance, fileName);

    try {
      await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("PDF saved to Firebase. Download URL:", downloadURL);
      setPdfSaved(true);
      setSaveConfirmation("PDF saved successfully!");
      setTimeout(() => setSaveConfirmation(""), 5000);
    } catch (error) {
      console.error("Error saving PDF to Firebase:", error);
      setSaveConfirmation("Error saving PDF. Please try again.");
      setTimeout(() => setSaveConfirmation(""), 5000);
    } finally {
      setSavingPDF(false); // Reset loading state when operation completes (success or failure)
    }
  };

  useEffect(() => {
    if (step === 8) {
      generatePDFPreview();
    }
  }, [step]);

  // ------------------------
  // Render Steps
  // ------------------------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-5 pb-2 border-b">
              Step 1: Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <ModernInput
                label="Full Name"
                placeholder="John Doe"
                value={resume.name}
                onChange={(e) => setResume({ ...resume, name: e.target.value })}
                error={fieldErrors.name}
              />
              <ModernInput
                label="Phone Number"
                placeholder="+1 123-456-7890"
                value={resume.phone}
                onChange={(e) =>
                  setResume({ ...resume, phone: e.target.value })
                }
                error={fieldErrors.phone}
              />
              <div className="md:col-span-2">
                <ModernInput
                  label="Email"
                  placeholder="email@example.com"
                  value={resume.email}
                  onChange={(e) =>
                    setResume({ ...resume, email: e.target.value })
                  }
                  error={fieldErrors.email}
                />
              </div>



              {/* <ModernInput
                label="LinkedIn URL"
                placeholder="https://www.linkedin.com/in/username"
                value={resume.linkedIn}
                onChange={(e) => setResume({ ...resume, linkedIn: e.target.value })}
                error={fieldErrors.linkedIn}
              /> */}
              <div className="md:col-span-2">
                <ModernInput
                  label="Address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={resume.address}
                  onChange={(e) =>
                    setResume({ ...resume, address: e.target.value })
                  }
                  error={fieldErrors.address}
                />
              </div>
            </div>

            {/* commented by hasib to remove the image upload option */}

            {/* <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (optional)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span>Upload Image</span>
                </label>
                
                {photoDataUrl && (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={photoDataUrl}
                        alt="Profile Preview"
                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        onClick={handleCancelPhoto}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200"
                        aria-label="Remove photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    {photoFileName && (
                      <span className="text-sm text-gray-500 truncate max-w-[180px]">{photoFileName}</span>
                    )}
                  </div>
                )}
              </div>
            </div> */}
          </div>
        );
      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 2: Work Experience
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter your work history, keeping your most recent position at the
              top.
            </p>

            {resume.workExperience.map((exp, index) => (
              <div
                key={index}
                className="mb-6 p-4 bg-white rounded-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">
                    Position {index + 1}
                  </h4>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => moveWorkExpUp(index)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {index < resume.workExperience.length - 1 && (
                      <button
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => moveWorkExpDown(index)}
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {resume.workExperience.length > 1 && (
                      <button
                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-colors text-red-500"
                        onClick={() => {
                          const newWorkExp = resume.workExperience.filter(
                            (_, i) => i !== index
                          );
                          setResume({ ...resume, workExperience: newWorkExp });
                        }}
                        aria-label="Remove"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="Software Engineer"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const newWorkExp = [...resume.workExperience];
                        newWorkExp[index].jobTitle = e.target.value;
                        setResume({ ...resume, workExperience: newWorkExp });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={exp.company}
                      onChange={(e) => {
                        const newWorkExp = [...resume.workExperience];
                        newWorkExp[index].company = e.target.value;
                        setResume({ ...resume, workExperience: newWorkExp });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Jan 2020"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newWorkExp = [...resume.workExperience];
                        newWorkExp[index].startDate = e.target.value;
                        setResume({ ...resume, workExperience: newWorkExp });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Present or Dec 2023"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newWorkExp = [...resume.workExperience];
                        newWorkExp[index].endDate = e.target.value;
                        setResume({ ...resume, workExperience: newWorkExp });
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibilities
                    </label>
                    {exp.responsibilities &&
                      Array.isArray(exp.responsibilities) ? (
                      <div className="space-y-2">
                        {exp.responsibilities.map((resp, respIndex) => (
                          <div
                            key={respIndex}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs text-gray-500 min-w-[20px]">
                              {respIndex + 1}.
                            </span>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                              value={resp}
                              onChange={(e) => {
                                const newExp = [...resume.workExperience];
                                newExp[index].responsibilities[respIndex] =
                                  e.target.value;
                                setResume({
                                  ...resume,
                                  workExperience: newExp,
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                        rows="3"
                        value={exp.responsibilities || ""}
                        onChange={(e) => {
                          const newExp = [...resume.workExperience];
                          newExp[index].responsibilities = e.target.value;
                          setResume({
                            ...resume,
                            workExperience: newExp,
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={() =>
                setResume({
                  ...resume,
                  workExperience: [
                    ...resume.workExperience,
                    {
                      jobTitle: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      responsibilities: "",
                    },
                  ],
                })
              }
            >
              <Plus className="w-4 h-4" />
              <span>Add Position</span>
            </button>
          </div>
        );
      case 3:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 3: Education
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter your educational background, starting with your most recent
              degree.
            </p>

            {resume.education.map((edu, index) => (
              <div
                key={index}
                className="mb-6 p-4 bg-white rounded-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">
                    Education {index + 1}
                  </h4>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => moveEduUp(index)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {index < resume.education.length - 1 && (
                      <button
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => moveEduDown(index)}
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {resume.education.length > 1 && (
                      <button
                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-colors text-red-500"
                        onClick={() => {
                          const newEdu = resume.education.filter(
                            (_, i) => i !== index
                          );
                          setResume({ ...resume, education: newEdu });
                        }}
                        aria-label="Remove"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School
                    </label>
                    <input
                      type="text"
                      placeholder="School Name"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[index].school = e.target.value;
                        setResume({ ...resume, education: newEdu });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Graduation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2023"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={edu.graduationYear}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[index].graduationYear = e.target.value;
                        setResume({ ...resume, education: newEdu });
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      placeholder="Degree"
                      className="w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[index].degree = e.target.value;
                        setResume({ ...resume, education: newEdu });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={() =>
                setResume({
                  ...resume,
                  education: [
                    ...resume.education,
                    { school: "", degree: "", graduationYear: "" },
                  ],
                })
              }
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>
        );
      case 4:
        return (
          <div className="max-w-3xl md:w-xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 4: Skills & Summary
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Summary
              </label>
              <textarea
                placeholder="A brief summary about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors min-h-[120px]"
                value={resume.summary}
                onChange={(e) =>
                  setResume({ ...resume, summary: e.target.value })
                }
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Skills (max 5)
                </label>
                <span className="text-xs text-gray-500">
                  {resume.skills.length}/5 skills added
                </span>
              </div>

              <div className="flex mb-3">
                <input
                  type="text"
                  placeholder="e.g., JavaScript"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  disabled={resume.skills.length >= 5}
                />
                <button
                  className={`px-4 flex items-center justify-center ${resume.skills.length >= 5 || !currentSkill.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90"
                    } text-white rounded-r-md transition-colors`}
                  onClick={() => {
                    if (currentSkill.trim() && resume.skills.length < 5) {
                      setResume({
                        ...resume,
                        skills: [...resume.skills, currentSkill.trim()],
                      });
                      setCurrentSkill("");
                    }
                  }}
                  disabled={resume.skills.length >= 5 || !currentSkill.trim()}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {resume.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.skills.map((skill, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2 group"
                    >
                      <span className="text-gray-800">{skill}</span>
                      <button
                        onClick={() => {
                          const newSkills = resume.skills.filter(
                            (_, index) => index !== i
                          );
                          setResume({ ...resume, skills: newSkills });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove skill"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-md hover:opacity-90 transition-colors mt-4"
              onClick={generateSuggestions}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Suggestions</span>
            </button>
          </div>
        );
      case 5:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 5: Additional Content
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Add optional information to enhance your resume.
            </p>

            {/* Languages Section */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Languages
                </label>
                <span className="text-xs text-gray-500">
                  {resume.additionalContent.languages.length} languages added
                </span>
              </div>

              <div className="flex mb-3">
                <input
                  type="text"
                  placeholder="e.g., English (Fluent)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                />
                <button
                  className={`px-4 flex items-center justify-center ${!currentLanguage.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90"
                    } text-white rounded-r-md transition-colors`}
                  onClick={() => {
                    if (currentLanguage.trim()) {
                      setResume({
                        ...resume,
                        additionalContent: {
                          ...resume.additionalContent,
                          languages: [
                            ...resume.additionalContent.languages,
                            currentLanguage.trim(),
                          ],
                        },
                      });
                      setCurrentLanguage("");
                    }
                  }}
                  disabled={!currentLanguage.trim()}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {resume.additionalContent.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.additionalContent.languages.map((lang, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2"
                    >
                      <span className="text-gray-800">{lang}</span>
                      <button
                        onClick={() => {
                          const newLang =
                            resume.additionalContent.languages.filter(
                              (_, index) => index !== i
                            );
                          setResume({
                            ...resume,
                            additionalContent: {
                              ...resume.additionalContent,
                              languages: newLang,
                            },
                          });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove language"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* References Section */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  References (Max 2)
                </label>
                <span className="text-xs text-gray-500">
                  {resume.additionalContent.references.length}/2 references
                  added
                </span>
              </div>

              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Reference Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
                    value={currentReferenceName}
                    onChange={(e) => setCurrentReferenceName(e.target.value)}
                    disabled={resume.additionalContent.references.length >= 2}
                  />
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Reference Contact"
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
                    value={currentReferenceContact}
                    onChange={(e) => setCurrentReferenceContact(e.target.value)}
                    disabled={resume.additionalContent.references.length >= 2}
                  />
                  <button
                    className={`px-4 flex items-center justify-center ${resume.additionalContent.references.length >= 2 ||
                        !currentReferenceName.trim() ||
                        !currentReferenceContact.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90"
                      } text-white rounded-r-md transition-colors`}
                    onClick={() => {
                      if (
                        currentReferenceName.trim() &&
                        currentReferenceContact.trim() &&
                        resume.additionalContent.references.length < 2
                      ) {
                        setResume({
                          ...resume,
                          additionalContent: {
                            ...resume.additionalContent,
                            references: [
                              ...resume.additionalContent.references,
                              {
                                name: currentReferenceName.trim(),
                                contact: currentReferenceContact.trim(),
                              },
                            ],
                          },
                        });
                        setCurrentReferenceName("");
                        setCurrentReferenceContact("");
                      }
                    }}
                    disabled={
                      resume.additionalContent.references.length >= 2 ||
                      !currentReferenceName.trim() ||
                      !currentReferenceContact.trim()
                    }
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {resume.additionalContent.references.length > 0 && (
                <div className="space-y-2">
                  {resume.additionalContent.references.map((ref, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 px-4 py-2 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {ref.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ref.contact}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newRef =
                            resume.additionalContent.references.filter(
                              (_, index) => index !== i
                            );
                          setResume({
                            ...resume,
                            additionalContent: {
                              ...resume.additionalContent,
                              references: newRef,
                            },
                          });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove reference"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="max-w-[1000px] w-[1000px] mob-maxw-100 mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 6: Template Selection
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose a template design for your resume.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 template-grid">
              {[
                "template2",
                "template3",
                "template4",
                "template5",
                "template6",
                "template7",
                "template8"
              ].map((tpl) => (
                <div
                  key={tpl}
                  className={`overflow-hidden rounded-md transition-all duration-200 cursor-pointer ${resume.template === tpl
                      ? "ring-2 ring-primary scale-[1.02]"
                      : "hover:shadow-md hover:scale-[1.02]"
                    }`}
                  onClick={() => setResume({ ...resume, template: tpl })}
                >
                  <div className="aspect-[3/4] template-card relative">
                    <img
                      src={templateImages[tpl]}
                      alt={tpl}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 ${resume.template === tpl
                          ? "bg-primary/10"
                          : "hover:bg-black/5"
                        }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 7: AI Optimization
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Enhance your resume with AI-powered optimization to highlight your
              strengths and improve your chances of getting noticed.
            </p>

            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center text-center">
                <Sparkles className="w-10 h-10 text-primary mb-3" />
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  AI Resume Optimization
                </h4>
                <p className="text-gray-600 mb-4">
                  Our AI will analyze your resume and suggest improvements to
                  your summary, skills, work experience, and education details.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
                  onClick={optimizeResume}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Optimize Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {showOptimizeModal && aiResume && editableAiResume && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                <div className="bg-white w-full max-w-5xl p-6 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-primary mb-4">
                    AI Optimized Resume Comparison
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Resume */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Current Resume
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700">
                            Summary:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {resume.summary || "No summary"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700">Skills:</h4>
                          {resume.skills && resume.skills.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm text-gray-600">
                              {resume.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-600">No skills</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700">
                            Work Experience:
                          </h4>
                          {resume.workExperience &&
                            resume.workExperience.length > 0 &&
                            resume.workExperience[0].jobTitle ? (
                            <div className="space-y-2">
                              {resume.workExperience.map((exp, index) => (
                                <div key={index} className="text-sm">
                                  <p className="font-medium">
                                    {exp.jobTitle} at {exp.company}
                                  </p>
                                  <p className="text-gray-600">
                                    {exp.startDate} - {exp.endDate}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              No work experience
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700">
                            Education:
                          </h4>
                          {resume.education &&
                            resume.education.length > 0 &&
                            resume.education[0].school ? (
                            <div className="space-y-2">
                              {resume.education.map((edu, index) => (
                                <div key={index} className="text-sm">
                                  <p className="font-medium">{edu.degree}</p>
                                  <p className="text-gray-600">
                                    {edu.school}, {edu.graduationYear}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              No education
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI-Optimized Resume (Editable) */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-primary mb-3">
                        AI-Optimized
                      </h3>

                      <div className="space-y-4">
                        {/* Summary Section */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">
                            Professional Summary
                          </h4>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
                            rows="3"
                            value={editableAiResume.summary}
                            onChange={(e) => {
                              setEditableAiResume({
                                ...editableAiResume,
                                summary: e.target.value,
                              });
                            }}
                          />
                        </div>

                        {/* Skills Section */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">
                            Skills
                          </h4>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                            rows="3"
                            value={
                              typeof editableAiResume.skills === "string"
                                ? editableAiResume.skills
                                : Array.isArray(editableAiResume.skills)
                                  ? editableAiResume.skills.join(", ")
                                  : ""
                            }
                            onChange={(e) => {
                              // Store skills as a string in the editable state
                              // It will be processed into an array when the resume is updated
                              setEditableAiResume({
                                ...editableAiResume,
                                skills: e.target.value,
                              });
                            }}
                          />
                        </div>

                        {/* Work Experience Section */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">
                            Work Experience
                          </h4>
                          {editableAiResume.workExperience.map(
                            (exp, expIndex) => (
                              <div
                                key={expIndex}
                                className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <label className="block text-xs text-gray-600">
                                      Job Title
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                      value={exp.jobTitle}
                                      onChange={(e) => {
                                        const newExp = [
                                          ...editableAiResume.workExperience,
                                        ];
                                        newExp[expIndex].jobTitle =
                                          e.target.value;
                                        setEditableAiResume({
                                          ...editableAiResume,
                                          workExperience: newExp,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600">
                                      Company
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                      value={exp.company}
                                      onChange={(e) => {
                                        const newExp = [
                                          ...editableAiResume.workExperience,
                                        ];
                                        newExp[expIndex].company =
                                          e.target.value;
                                        setEditableAiResume({
                                          ...editableAiResume,
                                          workExperience: newExp,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="mb-2">
                                  <label className="block text-xs text-gray-600">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    value={
                                      exp.duration ||
                                      `${exp.startDate} - ${exp.endDate}`
                                    }
                                    onChange={(e) => {
                                      const newExp = [
                                        ...editableAiResume.workExperience,
                                      ];
                                      newExp[expIndex].duration =
                                        e.target.value;
                                      setEditableAiResume({
                                        ...editableAiResume,
                                        workExperience: newExp,
                                      });
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Responsibilities
                                  </label>
                                  {exp.responsibilities &&
                                    Array.isArray(exp.responsibilities) ? (
                                    <div className="space-y-1">
                                      {exp.responsibilities.map(
                                        (resp, respIndex) => (
                                          <div
                                            key={respIndex}
                                            className="flex items-center gap-1"
                                          >
                                            <span className="text-xs text-gray-500 min-w-[15px]">
                                              {respIndex + 1}.
                                            </span>
                                            <input
                                              type="text"
                                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                              value={resp}
                                              onChange={(e) => {
                                                const newExp = [
                                                  ...editableAiResume.workExperience,
                                                ];
                                                newExp[
                                                  expIndex
                                                ].responsibilities[respIndex] =
                                                  e.target.value;
                                                setEditableAiResume({
                                                  ...editableAiResume,
                                                  workExperience: newExp,
                                                });
                                              }}
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <textarea
                                      className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                      rows="2"
                                      value={exp.responsibilities || ""}
                                      onChange={(e) => {
                                        const newExp = [
                                          ...editableAiResume.workExperience,
                                        ];
                                        newExp[expIndex].responsibilities =
                                          e.target.value;
                                        setEditableAiResume({
                                          ...editableAiResume,
                                          workExperience: newExp,
                                        });
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {/* Education Section */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">
                            Education
                          </h4>
                          {editableAiResume.education.map((edu, eduIndex) => (
                            <div
                              key={eduIndex}
                              className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200"
                            >
                              <div className="grid grid-cols-1 gap-2 mb-2">
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    School
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    value={edu.school}
                                    onChange={(e) => {
                                      const newEdu = [
                                        ...editableAiResume.education,
                                      ];
                                      newEdu[eduIndex].school = e.target.value;
                                      setEditableAiResume({
                                        ...editableAiResume,
                                        education: newEdu,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Degree
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const newEdu = [
                                        ...editableAiResume.education,
                                      ];
                                      newEdu[eduIndex].degree = e.target.value;
                                      setEditableAiResume({
                                        ...editableAiResume,
                                        education: newEdu,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Graduation Year
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    value={edu.graduationYear}
                                    onChange={(e) => {
                                      const newEdu = [
                                        ...editableAiResume.education,
                                      ];
                                      newEdu[eduIndex].graduationYear =
                                        e.target.value;
                                      setEditableAiResume({
                                        ...editableAiResume,
                                        education: newEdu,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowOptimizeModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                      onClick={handleReOptimize}
                    >
                      Re-Optimize
                    </button>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      onClick={handleUpdateAiResume}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-primary mb-2 pb-2 border-b">
              Step 8: Preview & Export
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your resume is ready! Preview and download it or save it to your
              account.
            </p>

            <div className="bg-white rounded-md shadow-sm overflow-hidden mb-8">
              {pdfBlob ? (
                // <iframe
                //   ref={pdfRef}
                //   src={pdfPreviewUrl}
                //   className="w-full h-[600px] border-0"
                //   title="Resume Preview"
                // ></iframe>
                <PDFPreview pdfBlob={pdfBlob} />
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-gray-50">
                  <p className="text-gray-500">Loading preview...</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                onClick={handleDownload}
              // onClick={downloadPDF}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download PDF
              </button>
              <button
                className="px-5 py-2.5 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={savePDFToFirebase}
                disabled={savingPDF || pdfSaved}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                {savingPDF
                  ? "Saving..."
                  : pdfSaved
                    ? "Saved to Account"
                    : "Save to Account"}
              </button>
            </div>

            {saveConfirmation && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-center">
                {saveConfirmation}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col mt-3">
      <div className="card w-full">
        {/* <h2 className="text-3xl font-bold text-center mb-6">Resume Builder</h2> */}
        {/* Progress Bar */}
        <div className="relative w-full h-3 rounded-full bg-gray-100 mb-8 overflow-hidden">
          <div className="absolute h-full top-0 left-0 flex">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`h-full w-[4.5rem] md:w-24 ${index < step ? "bg-primary" : "bg-transparent"
                  } ${index < 7 && "border-r border-white/30"
                  } transition-all duration-500 ease-out`}
              />
            ))}
          </div>
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
            style={{ width: `${(step / 8) * 100}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`relative h-3 flex items-center justify-center w-6 z-10 ${index < step ? "text-white" : "text-gray-400"
                  }`}
              >
                <span className="absolute text-[9px] font-semibold">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-center bg-red-100 p-2 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}
        {loading && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/90 to-primary/70 text-white text-center rounded-md shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </div>
          </div>
        )}
        {renderStep()}
        <div className={`flex justify-between mt-8 ${step === 6 && isMobile ? "bottom-fixed" : ""}`}>
          {step > 1 && (
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
              onClick={prevStep}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          )}
          {step < 8 && (
            <button
              className="ml-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
              onClick={nextStep}
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ResumeBuilder;
