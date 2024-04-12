import React, { useState } from "react";
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { SearchResults } from "./components/SearchResults";
import { NoticeDetails } from "./components/NoticeDetails";
import { SearchBar } from "./components/SearchBar";
import { AddNoticeModal } from "./components/AddNoticeModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noticeAdded, setNoticeAdded] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onNoticeAdded = () => {
    setNoticeAdded((prevState) => !prevState);
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col px-8 py-6 md:gap-y-16 min-h-screen bg-mainBeige font-jost">
        <Link href="/">
          <h1 className="text-2xl">Column</h1>
        </Link>
        <div className="flex flex-col md:items-center gap-y-8">
          <h2 className="md:text-2xl">
            The go-to repository for public notices.
          </h2>
          <SearchBar toggleModal={toggleModal} />
        </div>
        <Routes>
          <Route
            path="/"
            element={<SearchResults noticeAdded={noticeAdded} />}
          />
          <Route path="/notices/:id" element={<NoticeDetails />} />
        </Routes>
        {isModalOpen && (
          <AddNoticeModal
            onClose={() => setIsModalOpen(false)}
            onNoticeAdded={onNoticeAdded}
          />
        )}
      </div>
    </>
  );
}

export default App;
