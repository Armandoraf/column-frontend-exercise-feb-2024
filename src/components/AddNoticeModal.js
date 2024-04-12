import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../db";
import { X } from "@phosphor-icons/react";
import { toast } from "react-toastify";

//Note: Ideally, adding a new notice would not necessitate a full data refetch.
// Given more time, I would fix this via a state management/local storage solution as described in ./SearchResults.js

//Note: Potential inconsistencies arise in relying on Firestore handling dates in UTC while the notice reader/writer is in another zone (like PST)
//In order to sync any potential inconsistencies from adding modals, I would leverage the same strategy of timezone compensations as I did in the "Filter by date" results in ./SearchResults.js

export function AddNoticeModal({ onClose, onNoticeAdded }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const isFormValid = () => {
    return title && date && content;
  };

  const addNotice = async (notice) => {
    if (!isFormValid()) {
      console.error("Error submitting form: all values must be filled out.");
      toast.error("All values must be filled out.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "notices"), notice);
      return docRef;
    } catch (error) {
      console.error(`Error adding document: ${error.message}`);
      toast.error(`Error adding document: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const notice = {
      title,
      publicationDate: new Date(date),
      content,
    };

    try {
      const docRefId = await addNotice(notice);
      if (docRefId) {
        toast.success("Notice added successfully!");
        onNoticeAdded(); // Callback if the notice is successfully added
        onClose();
      } else {
        // Case where addNotice does not throw, but also doesn't succeed
        toast.error("Failed to add the notice. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting the notice: ", error);
      toast.error(
        "An error occurred while submitting the notice. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-10 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 md:w-1/4 w-5/6 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="items-start flex justify-between">
          <h2 className="text-xl mb-4">Add new notice</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors duration-300"
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col mb-8 gap-y-4">
          <div className="relative">
            <input
              type="text"
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              className="block px-4 pb-2 pt-3 w-full outline-none transition-colors duration-300 text-gray-900 bg-transparent border rounded border-gray-300 focus:ring-0 focus:border-black peer"
              placeholder="	"
            />
            <label
              for="title"
              className="absolute cursor-text text-gray-500 dark:text-textSlate duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Title
            </label>
          </div>
          <div className="relative">
            <input
              type="date"
              id="date"
              onChange={(e) => setDate(e.target.value)}
              className="block px-4 pb-2 pt-3 w-full text-gray-900 outline-none transition-colors duration-300 bg-transparent border rounded border-gray-300 focus:ring-0 focus:border-black peer"
              placeholder=" "
            />
            <label
              for="date"
              className="absolute cursor-text text-gray-500 dark:text-textSlate duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Date
            </label>
          </div>
          <div className="relative">
            <textarea
              id="content"
              onChange={(e) => setContent(e.target.value)}
              className="block px-4 py-2 w-full text-gray-900 outline-none transition-colors duration-300 bg-transparent border rounded border-gray-300 focus:ring-0 focus:border-black peer"
              placeholder=" "
              rows="4"
            ></textarea>
            <label
              for="content"
              className="absolute cursor-text text-gray-500 dark:text-textSlate duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-2.5 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Content
            </label>
          </div>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`py-2 px-4 border rounded ${
              isFormValid()
                ? `bg-black hover:bg-gray-800  text-white`
                : `bg-gray-200 text-gray-600 cursor-not-allowed`
            }  transition-colors duration-300`}
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
