import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";

export default function ListDropdown({ onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="btn btn-sm btn-solid-default hover:bg-[#454545] border-1 border-[#454545] rounded-sm "
        onClick={() => setOpen((prev) => !prev)}
      >
        <HiOutlineDotsVertical />
      </button>
      {open && (
        <div className="absolute right-0 model-content mt-1 z-10 w-24 bg-[#131313] p-2 rounded-md">
          <button
            onClick={onDelete}
            className="btn btn-solid-error w-full rounded-sm btn-sm "
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
