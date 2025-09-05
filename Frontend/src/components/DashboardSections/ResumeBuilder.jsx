import { useEffect, useState } from "react";
import { auth, storage } from "@/Firebase/firebase.config";
import { deleteObject, getDownloadURL, listAll, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Payment from "@/pages/Payment/Payment";

const ResumeBuilder = ({ setActiveSection }) => {
  const navigate = useNavigate();
  const [selected_pdf_link, set_selected_pdf_link] = useState(null);

  const handleCreateResume = () => {
    setActiveSection("Create New");
    navigate("/dashboard");
  };

  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null); // for modal

  useEffect(() => {
    const fetchResumes = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const uid = user.uid;
      const resumesRef = ref(storage, `resumes/${uid}/`);
      try {
        const res = await listAll(resumesRef);
        let resumeData = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              ref: itemRef,
              url,
              name: itemRef.name,
            };
          })
        );

        resumeData.sort((a, b) => {
          const extractTimestamp = (name) => {
            const parts = name.split("_");
            if (parts.length > 1) {
              const ts = parts[1].split(".")[0];
              return parseInt(ts, 10);
            }
            return 0;
          };
          return extractTimestamp(b.name) - extractTimestamp(a.name);
        });
        setSavedResumes(resumeData);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };
    fetchResumes();
  }, [auth.currentUser]);

  const handleDelete = async (itemRef) => {
    try {
      await deleteObject(itemRef);
      setSavedResumes((prev) =>
        prev.filter(
          (resumeItem) => resumeItem.ref.fullPath !== itemRef.fullPath
        )
      );
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex flex-row justify-start gap-3">
        <button
          onClick={handleCreateResume}
          className="border border-gray-300 w-fit px-12 py-16 group rounded-md hover:cursor-pointer hover:scale-105 transform transition-transform duration-300 ease-in-out"
        >
          <svg
            className="w-12 h-12 transition-transform duration-300 ease-in-out group-hover:rotate-90 bg-gray-200 group-hover:bg-primary px-2 py-1 rounded-full"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 12.5H6.50001C6.35801 12.5 6.23934 12.452 6.14401 12.356C6.04867 12.26 6.00067 12.141 6.00001 11.999C5.99934 11.857 6.04734 11.7383 6.14401 11.643C6.24067 11.5477 6.35934 11.5 6.50001 11.5H11.5V6.50001C11.5 6.35801 11.548 6.23934 11.644 6.14401C11.74 6.04867 11.859 6.00067 12.001 6.00001C12.143 5.99934 12.2617 6.04734 12.357 6.14401C12.4523 6.24067 12.5 6.35934 12.5 6.50001V11.5H17.5C17.642 11.5 17.7607 11.548 17.856 11.644C17.9513 11.74 17.9993 11.859 18 12.001C18.0007 12.143 17.9527 12.2617 17.856 12.357C17.7593 12.4523 17.6407 12.5 17.5 12.5H12.5V17.5C12.5 17.642 12.452 17.7607 12.356 17.856C12.26 17.9513 12.141 17.9993 11.999 18C11.857 18.0007 11.7383 17.9527 11.643 17.856C11.5477 17.7593 11.5 17.6407 11.5 17.5V12.5Z"
              fill="#EF8747"
            />
          </svg>
        </button>

        <div className="font-pextralight text-primary max-w-sm">
          <p className="text-lg">Create New Resume</p>
          <p className="text-sm">
            Build a customized resume for every job application and boost your
            chances of getting hired faster!
          </p>
        </div>
      </div>

      <dialog id="my_modal_2" className="modal ">
        <div className="modal-box !bg-white w-[750px] max-w-[750px]">
          {/* <h3 className="font-bold text-lg">Hello!</h3>
           <p className="py-4">
            Press ESC key or click the button below to close
          </p> */}
          <Payment
            modal_id={"my_modal_2"}
            downloadPDF={() => {
              if (selected_pdf_link) {
                  window.open(selected_pdf_link, "_blank")
              }
              set_selected_pdf_link(null);
            }}
            savePDFToFirebase={() => {}}
          ></Payment>
          <div className="modal-action flex justify-center items-center">
            <form method="dialog" className="">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn border border-blue-900">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>

      <div className="border-t border-gray-300 mt-5">
        <p className="text-lg font-pextralight text-primary mt-5">My Resumes</p>
        {savedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {savedResumes.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary">
                      Resume {index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          set_selected_pdf_link(item.url);
                          document.getElementById("my_modal_2").showModal();
                        }} // call your function here
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100"
                        title="Download Resume"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.ref)}
                        className="text-red-600 cursor-pointer hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                        title="Delete Resume"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Small Preview */}
                <div className="w-full h-80 overflow-hidden bg-white">
                  <iframe
                    src={`${item.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full pointer-events-none"
                    style={{
                      backgroundColor: "white",
                      border: "none",
                    }}
                    title={`Resume Preview ${index + 1}`}
                  />
                </div>

                {/* Footer: View Button */}
                <div className="p-3 bg-white flex justify-center">
                  <button
                    onClick={() => setSelectedResume(item)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500 italic">No resumes saved.</p>
        )}
      </div>

      {/* Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 h-5/6 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-primary">
                {selectedResume.name}
              </h2>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-gray-600 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${selectedResume.url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none"
                style={{ border: "none", backgroundColor: "white" }}
                title="Resume Full View"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
