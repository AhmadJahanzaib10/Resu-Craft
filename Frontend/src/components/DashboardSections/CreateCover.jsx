import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { auth } from "../../firebase";
import { Sparkles, Edit, Save } from "lucide-react";
import useAuth from "@/hooks/useAuth";

function CreateCover() {
  // Form fields for cover letter details
  const [coverDate, setCoverDate] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const {user} = useAuth()
  if (!user) {
      console.error("User is not logged in");
      return;
    }
    const uid = user.uid;

  // Cover letter body returned from Gemini (only the body)
  const [coverLetter, setCoverLetter] = useState("");

  // Add state for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");

  // Loading and error state for Gemini API calls
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal state for previewing the cover letter
  const [modalOpen, setModalOpen] = useState(false);

  // Gemini call to generate cover letter body only
  const generateCoverLetter = async () => {
    setLoading(true);
    setErrorMessage("");

    const prompt = `
      You are an expert cover letter writer.
      Using the following details:
      Date: ${coverDate}
      Requester's Name: ${requesterName}
      Company Name: ${companyName}
      Position: ${position}

      make it minimum 150 words.
      Generate ONLY the body text for a cover letter that is formal, concise, and tailored to the position.
      Do NOT include any header, salutation, or footer.
      Return a plain JSON object with a single key "body" that contains the cover letter body text.
       ****STRICT INSTRUCTIONS:
      - DON'T INCLUDE ANY PLACEHOLDERS IN THE OUTPUT Ex:"[Mention relevant skills] , [Platform where you saw the advertisement - e.g., Acme's website, LinkedIn] ,[Mention something specific about the company that interests you, e.g., innovation in the technology industry, its contributions to the community, its work culture]". GENERATE THE BODY WITH WHATEVER DETAILS PROVIDED.
      ****
      Example output:
      {
        "body": "I am writing to express my interest in the Software Engineer position at Acme Corp. My experience in developing robust software solutions has prepared me to contribute effectively..."
      }
    `;
    console.log("Gemini Cover Letter Prompt:", prompt);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      console.log("Full Gemini Result:", JSON.stringify(result, null, 2));

      let responseText =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      responseText = responseText.trim();

      // Remove code block markers if present.
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/```json|```/g, "").trim();
      }
      console.log("Cleaned Gemini Response:", responseText);

      const geminiOutput = JSON.parse(responseText);
      setCoverLetter(geminiOutput.body || "");
      setModalOpen(true);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setErrorMessage("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export cover letter as PDF using Times New Roman, dynamic spacing, and a border.
  const exportPDF = async () => {
    const doc = new jsPDF("portrait", "pt", "letter");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const textMargin = margin + 20; // 20pt extra inner margin
    const textAreaWidth = pageWidth - 2 * textMargin;

    // Use Times New Roman throughout (jsPDF supports "times")
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const lineHeight = 18; // increased space between lines

    // Build content blocks:
    const headerLines = [companyName + ",", coverDate];
    const salutation = "Dear Hiring Manager,";
    const bodyLines = doc.splitTextToSize(coverLetter, textAreaWidth);
    const footerLines = ["Sincerely,", requesterName];

    // Gaps between groups (in number of empty lines)
    const gapHeaderSalutation = 2; // e.g., 2 blank lines
    const gapSalutationBody = 3;
    const gapBodyFooter = 3;

    // Combine all lines
    let allLines = [
      ...headerLines,
      ...Array(gapHeaderSalutation).fill(""),
      salutation,
      ...Array(gapSalutationBody).fill(""),
      ...bodyLines,
      ...Array(gapBodyFooter).fill(""),
      ...footerLines,
    ];

    // Calculate total height of the content
    const totalHeight = allLines.length * lineHeight;
    // Dynamic vertical offset to center content on the page
    const startY = (pageHeight - totalHeight) / 2;

    // Draw a border using the original margin
    doc.setLineWidth(1);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Print each line using the inner margin for text
    allLines.forEach((line, index) => {
      doc.text(line, textMargin, startY + index * lineHeight);
    });

    //FIREBASE SAVE
    const pdfBlob = doc.output("blob");
    
    

    // Create a unique file name and path (e.g., coverLetters/{uid}/coverletter_TIMESTAMP.pdf)
    const fileName = `coverLetters/${uid}/coverletter_${Date.now()}.pdf`;
    const storage = getStorage();
    const storageRef = ref(storage, fileName);

    try {
      // Upload the PDF Blob to Firebase Storage
      await uploadBytes(storageRef, pdfBlob);
      // Optionally, get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("PDF uploaded to Firebase. Download URL:", downloadURL);
      // You could store this URL in your database for later retrieval.
      doc.save("cover_letter.pdf");
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  };

  // Function to handle edit mode toggle
  const toggleEditMode = () => {
    if (!isEditing) {
      // When entering edit mode, initialize the editable text with current cover letter
      setEditedCoverLetter(coverLetter);
    } else {
      // When saving, update the cover letter with edited content
      setCoverLetter(editedCoverLetter);
    }
    setIsEditing(!isEditing);
  };

  // Build a preview string that mimics the PDF layout.
  const previewContent = `
${companyName}, 
${coverDate}

Dear Hiring Manager,

${coverLetter}

Sincerely,
${requesterName}
  `;

  return (
    <div className="p-6">
      <h1 className="text-xl text-primary font-pextralight mb-4">
        Create Cover Letter
      </h1>
      <form className="space-y-4">
        <div>
          <label className="block font-plight mb-1">Date</label>
          <input
            type="date"
            value={coverDate}
            onChange={(e) => setCoverDate(e.target.value)}
            className="input input-bordered w-fit"
          />
        </div>
        <div>
          <label className="block font-plight mb-1">Requester's Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className="input input-bordered w-full border p-1"
          />
        </div>
        <div>
          <label className="block font-plight mb-1">Company Name</label>
          <input
            type="text"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input input-bordered w-full border p-1"
          />
        </div>
        <div>
          <label className="block font-plight mb-1">Position</label>
          <input
            type="text"
            placeholder="Software Engineer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="input input-bordered w-full  border p-1"
          />
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
        <button
          type="button"
          className="bg-gradient-to-r from-primary to-tertiary text-white flex items-center p-2 rounded-3xl px-4 hover:opacity-90 transition duration-300 cursor-pointer"
          onClick={generateCoverLetter}
          disabled={loading}
        >
          <Sparkles className="w-5 h-5 mr-2 text-white" />
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      </form>

      {/* Modal Preview & Export */}
      {modalOpen && (
        <div className="flex mt-10">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-pextralight">Cover Letter Preview</h2>
              <button
                className="text-primary hover:text-tertiary flex items-center gap-1"
                onClick={toggleEditMode}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" /> Edit
                  </>
                )}
              </button>
            </div>
            <div className="border p-4 rounded mb-4 h-96">
              {isEditing ? (
                <textarea
                  className="w-full h-full p-0 border-none focus:outline-none resize-none overflow-auto"
                  value={editedCoverLetter}
                  onChange={(e) => setEditedCoverLetter(e.target.value)}
                />
              ) : (
                <pre className="whitespace-pre-wrap h-full overflow-auto">
                  {previewContent}
                </pre>
              )}
            </div>
            <button
              className="w-fit bg-primary text-white px-3 py-2 rounded-3xl hover:text-tertiary cursor-pointer"
              onClick={exportPDF}
            >
              Export as PDF
            </button>
            <button
              className="ml-5 text-red-600"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCover;
