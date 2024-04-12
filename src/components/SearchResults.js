import React, { useEffect, useState } from "react";
import { db } from "../db";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { NoticeCard } from "./NoticeCard";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

// Note: Currently, navigating to a NoticeDetails page and then navigating back to the SearchResults page (or just refreshing the SearchResults page) resets the pagination state.
// Ideally, users would expect to return to the same point in the list of notices where they left off.
// Given more time, I would implement a solution to preserve the pagination state. Possible approaches include storing the pagination state in a global state (like Redux or React Context) or leveraging the browser's sessionStorage to remember the "current page".

// Note 2 on my choice for "Load more" pagination is at the bottom of this file.

export function SearchResults({ noticeAdded }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const searchDate = searchParams.get("date") || "";
  const [notices, setNotices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [lastVisible, setLastVisible] = useState(null);
  const [isMoreAvailable, setIsMoreAvailable] = useState(true);

  const pageSize = 10;

  const refreshData = async () => {
    setIsLoading(true);
    setLastVisible(null);

    const q = constructQuery({ pageSize, searchQuery, searchDate });

    try {
      const documentSnapshots = await getDocs(q);
      const isExtraDocFetched = documentSnapshots.docs.length > pageSize;
      const newNotices = documentSnapshots.docs
        .slice(0, pageSize) // Only take up to the pageSize documents for display
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setNotices(newNotices);
      setIsMoreAvailable(isExtraDocFetched); // Determine if more documents are available
      if (isExtraDocFetched) {
        // Update lastVisible to the last document intended for display, not the extra one
        setLastVisible(documentSnapshots.docs[pageSize - 1]);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to fetch notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!isMoreAvailable || isLoadingMore) return;

    setIsLoadingMore(true);

    const q = constructQuery({
      lastVisible,
      pageSize,
      searchQuery,
      searchDate,
    });

    try {
      const documentSnapshots = await getDocs(q);
      const fetchedDocs = documentSnapshots.docs;
      const isExtraDocFetched = fetchedDocs.length > pageSize;
      const newNotices = fetchedDocs
        .slice(0, isExtraDocFetched ? pageSize : fetchedDocs.length)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setNotices((prevNotices) => [...prevNotices, ...newNotices]);
      setIsMoreAvailable(isExtraDocFetched);
      if (isExtraDocFetched) {
        // Update lastVisible to the last document intended for display, not the extra one
        setLastVisible(fetchedDocs[pageSize - 1]);
      } else if (fetchedDocs.length) {
        // If no extra document and documents were fetched, update lastVisible to the last fetched document
        setLastVisible(fetchedDocs[fetchedDocs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to fetch next page of notices:", error);
      setNotices([]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [searchQuery, searchDate, noticeAdded]); // Refetch data when search query changes or when a new notice is posted

  return (
    <div className="md:mx-16 xl:mx-32 mt-8 md:mt-0 flex-1 flex flex-col">
      <span className="text-2xl">
        Results {searchQuery && `for "${searchQuery}"`}
      </span>
      {notices.length ? (
        <div className="w-full flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 md:gap-y-16 mt-6 md:mt-10">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              id={notice.id}
              title={notice.title}
              date={new Date(
                notice.publicationDate.seconds * 1000
              ).toLocaleDateString()}
              content={notice.content}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center flex-1">
          <span className="text-xl">
            {isLoading ? `Loading...` : `No results found.`}
          </span>
        </div>
      )}
      {isMoreAvailable && !isLoading && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={fetchNextPage}
            className="text-lg border border-black text-black px-6 py-3 rounded hover:bg-black hover:text-mainBeige transition-colors duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

const constructQuery = ({
  lastVisible = null,
  pageSize = 10,
  searchQuery = "",
  searchDate = "",
}) => {
  const noticesRef = collection(db, "notices");
  let q = query(noticesRef, orderBy("publicationDate", "desc"));

  if (searchQuery) {
    q = query(
      noticesRef,
      where("title", "==", searchQuery),
      orderBy("publicationDate", "desc")
    );
  }

  const { startOfDay, endOfDay } = getStartAndEndOfDay(searchDate);
  if (startOfDay && endOfDay) {
    q = query(
      q,
      where("publicationDate", ">=", startOfDay),
      where("publicationDate", "<=", endOfDay)
    );
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible), limit(pageSize + 1));
  } else {
    q = query(q, limit(pageSize + 1));
  }

  return q;
};

const getStartAndEndOfDay = (searchDate) => {
  if (!searchDate) return {};

  const startOfDay = new Date(searchDate + "T00:00:00Z"); // Start of day in UTC
  const endOfDay = new Date(searchDate + "T23:59:59Z"); // End of day in UTC

  // Translate UTC date to PST (which all our Firestore documents are in)
  startOfDay.setHours(startOfDay.getHours() + 8);
  endOfDay.setHours(endOfDay.getHours() + 8);

  return { startOfDay, endOfDay };
};

//Note: The decision to paginate with "Load more" was to optimize core functionalities and user experience.
// Implementing traditional pagination with good UX (random access, catering to newly-added notices, efficient client-side) would have been hard to do in the 3 hour time-frame given Firestore's cursor-based pagination.
// Here's a starting point for how I would have implemented more traditional pagination (this was done after the 3-hour limit for the assignment)

// const pageNum = parseInt(pageNumber, 10);

//   const [pageSnapshots, setPageSnapshots] = useState([]); // Stores the first doc of each page

//   const fetchData = async (page) => {
//     setLoading(true);

//     const noticesRef = collection(db, "notices");
//     let q;
//     const pageSize = 10;

//     if (page === 1) {
//       q = query(
//         noticesRef,
//         orderBy("publicationDate", "desc"),
//         limit(pageSize)
//       );
//     } else {
//       // Adjusting logic to use the last document of the previous batch for pagination
//       const lastDocOfPrevPage = pageSnapshots[page - 2]; // Assuming pageSnapshots keeps the *last* doc of each page
//       if (!lastDocOfPrevPage) {
//         console.error("Error: Previous page snapshot is undefined.");
//         setLoading(false);
//         return; // Exiting the function early if the snapshot is undefined
//       }
//       q = query(
//         noticesRef,
//         orderBy("publicationDate", "desc"),
//         startAfter(lastDocOfPrevPage),
//         limit(pageSize)
//       );
//     }

//     try {
//       const querySnapshot = await getDocs(q);
//       const fetchedNotices = [];

//       if (!querySnapshot.empty) {
//         // Adjusting to capture the last document of the current batch
//         if (page > pageSnapshots.length) {
//           // Update only if this is a new page, not revisiting an old one
//           setPageSnapshots((prevSnapshots) => [
//             ...prevSnapshots,
//             querySnapshot.docs[querySnapshot.docs.length - 1],
//           ]);
//         }

//         setNotices(
//           querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//         );
//       }
//     } catch (error) {
//       console.error("Failed to fetch notices:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData(pageNum);
//   }, [pageNum, searchQuery]);

//   const goToNextPage = () => {
//     if (searchQuery) {
//       setSearchParams({ pageNumber: pageNum + 1, query: searchQuery });
//     } else {
//       setSearchParams({ pageNumber: pageNum + 1 });
//     }
//   };

//   const goToPreviousPage = () => {
//     if (pageNum > 1) {
//       if (searchQuery) {
//         setSearchParams({ pageNumber: pageNum - 1, query: searchQuery });
//       } else {
//         setSearchParams({ pageNumber: pageNum - 1 });
//       }
//     }
//   };
