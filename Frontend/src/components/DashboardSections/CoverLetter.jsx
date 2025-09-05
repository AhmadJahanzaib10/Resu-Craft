import React,{ useState, useEffect } from 'react'
// import { auth, storage } from "../../firebase"; // adjust path as needed
import { listAll, ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { auth, storage } from '@/Firebase/firebase.config';

function CoverLetter({ setActiveSection }) {
  const navigate = useNavigate();
  const [savedCoverLetters, setSavedCoverLetters] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateCoverLetter = () => {
    setActiveSection("Create New Cover"); // Update section
    navigate("/dashboard"); // Navigate to Dashboard
  };
  

  // Fetch cover letters for the logged-in user
  useEffect(() => {
    const fetchCoverLetters = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const uid = user.uid;
      const coverLettersRef = ref(storage, `coverLetters/${uid}/`);
      try {
        const res = await listAll(coverLettersRef);
        const coverLetterData = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              ref: itemRef,
              url,
              name: itemRef.name,
            };
          })
        );
        // Optionally, sort the resumes (e.g. latest first) if your filenames contain a timestamp.
        setSavedCoverLetters(coverLetterData);
      } catch (error) {
        console.error("Error fetching cover letters:", error);
        setErrorMessage("Failed to fetch cover letters.");
      }
    };
    fetchCoverLetters();
  }, [auth.currentUser]);

  // Delete a cover letter file from Firebase Storage
  const handleDelete = async (itemRef) => {
    try {
      await deleteObject(itemRef);
      setSavedCoverLetters((prev) =>
        prev.filter((item) => item.ref.fullPath !== itemRef.fullPath)
      );
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      setErrorMessage("Failed to delete cover letter.");
    }
  };
  return (
    <div className="mt-3">
      <div className="flex flex-row justify-start gap-3">
        <button onClick={handleCreateCoverLetter} className="border border-gray-300 w-fit px-12 py-16 group rounded-md hover:cursor-pointer hover:scale-105 transform transition-transform duration-300 ease-in-out">
          <svg className="w-12 h-12 transition-transform duration-300 ease-in-out group-hover:rotate-90 bg-gray-200 group-hover:bg-primary px-2 py-1 rounded-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 12.5H6.50001C6.35801 12.5 6.23934 12.452 6.14401 12.356C6.04867 12.26 6.00067 12.141 6.00001 11.999C5.99934 11.857 6.04734 11.7383 6.14401 11.643C6.24067 11.5477 6.35934 11.5 6.50001 11.5H11.5V6.50001C11.5 6.35801 11.548 6.23934 11.644 6.14401C11.74 6.04867 11.859 6.00067 12.001 6.00001C12.143 5.99934 12.2617 6.04734 12.357 6.14401C12.4523 6.24067 12.5 6.35934 12.5 6.50001V11.5H17.5C17.642 11.5 17.7607 11.548 17.856 11.644C17.9513 11.74 17.9993 11.859 18 12.001C18.0007 12.143 17.9527 12.2617 17.856 12.357C17.7593 12.4523 17.6407 12.5 17.5 12.5H12.5V17.5C12.5 17.642 12.452 17.7607 12.356 17.856C12.26 17.9513 12.141 17.9993 11.999 18C11.857 18.0007 11.7383 17.9527 11.643 17.856C11.5477 17.7593 11.5 17.6407 11.5 17.5V12.5Z" fill="#EF8747" />
          </svg>
        </button>

        <div className="font-pextralight text-primary max-w-sm">
          <p className="text-lg">Create New Cover Letter</p>
          <p className="text-sm">Craft a personalized cover letter for each job application and make a lasting impression on employers!</p>
        </div>

      </div>

      <div className="border-t border-gray-300 mt-5">
        <p className="text-lg font-pextralight text-primary mt-5">My Cover Letters</p>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
        {savedCoverLetters.length > 0 ? (
          savedCoverLetters.map((item, index) => (
           <div key={index} className="flex justify-between border p-2 rounded my-2">
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold">{item.name}</span>
                        <div className="w-48 h-48 border">
                          <iframe
                            src={item.url}
                            title={`Preview ${item.name}`}
                            className="w-full h-full"
                            // style={{ filter: "blur(4px)" }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 items-end">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(item.ref)}
                          className="text-red-500 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
          ))
        ) : (
          <p className="mt-2">No cover letters saved.</p>
        )}
      </div>
    </div>
  )
}

export default CoverLetter