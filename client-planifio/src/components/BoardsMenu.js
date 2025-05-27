import { useNavigate, useParams } from "react-router-dom";
import { IoFolderOpen } from "react-icons/io5";
import { FaFolderOpen } from "react-icons/fa6";
import BoardsStore from "../Context/BoardsStore"; // Assuming you've exported `useStore` from your Zustand store
import ListDropdown from "./ListDropdown";

export default function BoardsMenu({closeSideBar}) {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // Correctly using `useStore` to subscribe to the `boards` state
  const boards = BoardsStore((state) => state.boards);

  return (
    <>
      <input
        type="checkbox"
        id="menu-2"
        className="menu-toggle [&:checked~.menu-item>.menu-icon]:-rotate-90"
      />
      <label className="menu-item justify-between rounded-sm" htmlFor="menu-2">
      
        <span className="flex items-center justify-start gap-1 font-semibold"> Boards</span>
        <span className="menu-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="w-4 h-4 stroke-content3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </span>
      </label>

      <div className="menu-item-collapse">
        <div className="min-h-0">
          {boards.map((board) => (
            <div className="relative  " key={board.id} onClick={() => {
                closeSideBar();
                navigate(`/dashboard/${board.id}`);
              }}>
            <li className="menu-item rounded-none">
              {boardId === board.id ? <FaFolderOpen />:<IoFolderOpen />}
              {board.name}
            </li>
          </div>
          ))}
        </div>
      </div>
    </>
  );
}
