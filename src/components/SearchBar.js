import { useState, useEffect } from "react";
import { FunnelSimple, PlusCircle, ArrowRight, X } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function SearchBar({ toggleModal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  function useDebounce(value) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, 500);

      return () => clearTimeout(handler);
    }, [value]);

    return debouncedValue;
  }

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedSelectedDate = useDebounce(selectedDate, 500);

  const toggleDateFilter = () => {
    setIsDateFilterOpen(!isDateFilterOpen);
  };

  const handleDateChange = (event) => {
    const value = event.target.value;
    const selectedDate = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (selectedDate > now) {
      toast.error("Date cannot be in the future.");
    } else {
      setSelectedDate(value);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (!value.trim() && value.length > 0) {
      toast.error("Search term cannot be only spaces.");
    } else {
      setSearchTerm(value);
    }
  };

  useEffect(() => {
    setShouldNavigate(true);
  }, [debouncedSearchTerm, debouncedSelectedDate]);

  useEffect(() => {
    if (shouldNavigate) {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set("query", debouncedSearchTerm);
      if (debouncedSelectedDate) params.set("date", debouncedSelectedDate);

      navigate({
        pathname: "/",
        search: params.toString(),
      });

      setShouldNavigate(false); // Reset to prevent unintended navigation when routing to notice details
    }
  }, [debouncedSearchTerm, debouncedSelectedDate, navigate, shouldNavigate]);

  return (
    <div className="relative group flex border border-gray-300 py-3 rounded flex-col md:w-3/5 lg:w-1/2 xl:w-2/5 focus-within:border-black transition-colors duration-300 ease-in-out">
      <textarea
        className="px-4 h-16 bg-transparent outline-none placeholder-gray-600 resize-none"
        placeholder="Search public notices..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="px-2 flex justify-between items-center">
        <div className="flex relative gap-x-4">
          <button
            className="flex items-center text-gray-600 gap-x-1.5 rounded-full hover:bg-black hover:text-mainBeige px-2 py-1 transition-all duration-300"
            onClick={toggleDateFilter}
          >
            <FunnelSimple size={16} />
            <span className="text-sm font-medium">Filter by date</span>
          </button>
          {isDateFilterOpen && (
            <div className="absolute rounded top-full mt-2 left-0 bg-white border border-gray-300 z-10 p-4 flex flex-col gap-2">
              <div className="w-full flex justify-between">
                <label htmlFor="filter-date">Date:</label>
                <button onClick={() => setIsDateFilterOpen(false)}>
                  <X />
                </button>
              </div>

              <input
                type="date"
                id="filter-date"
                value={selectedDate}
                onChange={handleDateChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          )}
          <button
            className="flex items-center text-gray-600 gap-x-1.5 rounded-full hover:bg-black hover:text-mainBeige px-2 py-1 transition-all duration-300"
            onClick={toggleModal}
          >
            <PlusCircle size={16} />
            <span className="text-sm font-medium">Add notice</span>
          </button>
        </div>
        <button
          className={`${
            searchTerm || selectedDate
              ? `bg-black text-mainBeige cursor-pointer`
              : `cursor-default text-gray-400`
          } transition-colors duration-300 rounded-full h-6 w-6 flex items-center justify-center`}
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
