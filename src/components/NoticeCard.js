import { CaretDoubleRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function NoticeCard({ id, title, date, content }) {
  return (
    <Link
      to={`/notices/${id}`}
      className="group md:w-64 md:h-72 h-52 border border-gray-600 rounded flex flex-col"
    >
      <div className="flex-grow overflow-hidden">
        <div className="md:flex flex-col justify-between gap-y-4 group-hover:hidden hidden group-focus:hidden py-6 px-4 h-full">
          <span className="text-3xl">{title}</span>
        </div>
        <div className=" flex flex-col py-4 px-4 h-full">
          <div className="flex flex-col gap-y-1 h-full">
            <span className="text-lg md:text-xs md:truncate py-2 md:opacity-0 group-hover:opacity-100 group-focus:opacity-100 font-semibold transition-opacity duration-300">
              {title}
            </span>
            {/* Given more time, I would add custom multi-line truncation for the content preview on small screens; for now, I decided to have the preview be scrollable. */}
            <div className="overflow-y-auto md:opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
              <p className="text-sm text-gray-600">{content}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between px-4 pb-3">
        <span className="text-gray-600">{date}</span>
        <button className="rounded-full group-hover:bg-black group-hover:text-mainBeige transition-colors duration-300 w-fit h-fit p-1">
          <CaretDoubleRight size={20} />
        </button>
      </div>
    </Link>
  );
}
