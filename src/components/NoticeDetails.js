import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../db";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft } from "@phosphor-icons/react";
import { toast } from "react-toastify";

export function NoticeDetails() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchNotice = async () => {
      const docRef = doc(db, "notices", id);
      try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNotice({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error(`Document with id ${id} not found.`);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("An error occurred while fetching the notice.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  return (
    <div className="flex-1 flex flex-col gap-y-2 md:mx-32 md:mt-0 mt-16">
      <Link
        to="/"
        className="flex items-center gap-2 text-xl hover:underline w-fit"
      >
        <ArrowLeft />
        <span>Back to all notices</span>
      </Link>
      {notice ? (
        <>
          <span className="text-5xl mt-8">{notice.title}</span>
          <span className="text-3xl text-gray-500">
            {new Date(
              notice.publicationDate.seconds * 1000
            ).toLocaleDateString()}
          </span>
          <span className="mt-8 text-xl">{notice.content}</span>
        </>
      ) : (
        <div className="flex text-center justify-center items-center flex-1">
          <span className="text-xl">
            {isLoading ? `Loading...` : `Could not find notice with id: ${id}`}
          </span>
        </div>
      )}
    </div>
  );
}
