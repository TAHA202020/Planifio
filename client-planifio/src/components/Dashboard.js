import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "../Utils/Auth";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { HiOutlineRectangleStack } from "react-icons/hi2";

import BoardsStore from "../Context/BoardsStore";
import BoardsMenu from "./BoardsMenu";
import AddBoard from "./AddBoard";
export default function Dashboard({}) {
  const createProjectRef = useRef(null);
  const [Loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const setBoardsStore = BoardsStore((state) => state.setBoardsStore);
  function transformBackendData(backendBoards) {
    const boards = [];
    const lists = {};
    const cards = {};
    const events = {};

    backendBoards.forEach((board) => {
      boards.push({
        id: board.id,
        name: board.name || "",
      });

      lists[board.id] = board.lists.map((list) => {
        const cardIds = list.cards.map((card) => {
          const cardData = {
            id: card.id,
            title: card.title,
            description: card.description || "",
            dueDate: card.dueTime || null,
          };

          cards[card.id] = cardData;

          if (cardData.dueDate) {
            events[card.id]={
              id: card.id,
              title: card.title,
              date: cardData.dueDate,
              boardId: board.id,
              listTitle: list.title,
            };
          }

          return card.id;
        });

        return {
          id: list.id,
          title: list.title,
          cardIds: cardIds,
        };
      });
    });
    return { boards, lists, cards, events };
  }


  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:8000/boards/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 200) {
        const data = await res.json();
        setBoardsStore(transformBackendData(data.boards));
        setLoading(false);
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/authentication");
      }
    } catch (error) {
      console.log("Error fetching boards:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/authentication");
  };
  useEffect(() => {
    if (!isAuth) {
      navigate("/authentication");
      return;
    }
    loadData();
  }, []);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  if (Loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
   

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (absolute) */}
      <aside
        className={`absolute left-0 top-0 z-40 w-64 h-full bg-white shadow-md transition-transform duration-150 bg-[#232323] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
		<section class="sidebar-title items-center p-4 bg-[#232323]">
		<svg fill="none" height="42" viewBox="0 0 32 32" width="42" xmlns="http://www.w3.org/2000/svg">
			<rect height="100%" rx="16" width="100%"></rect>
			<path clip-rule="evenodd" d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z" fill="currentColor" fill-rule="evenodd"></path>
		</svg>
		<div class="flex flex-col">
			<span>Planifio</span>
			<span class="text-xs font-normal text-content2">For Planning</span>
		</div>
	</section>
        <section className="sidebar-content bg-[#232323]">
          <BoardsMenu />
          <Link className="menu-item block font-semibold" to={"/dashboard/calendar"}>
            Calendar
          </Link>
        </section>
        <section className="sidebar-footer absolute bottom-0 w-full bg-[#232323]">
          <button className="btn btn-primary w-full rounded-none" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </aside>

      {/* Main Content */}
      <div className="relative h-full w-full flex flex-col">
        {/* Top Bar */}
        <div className="px-7 py-3 bg-[#232323] flex justify-between items-center z-10">
          <div className="flex items-center gap-5 w-full text-white">
			<svg fill="none" height="42" viewBox="0 0 32 32" width="42" xmlns="http://www.w3.org/2000/svg">
			<rect height="100%" rx="16" width="100%"></rect>
			<path clip-rule="evenodd" d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z" fill="currentColor" fill-rule="evenodd"></path>
		</svg>
            <button className="btn rounded-sm btn-sm btn-primary font-bold" onClick={toggleSidebar}>
				<HiOutlineRectangleStack className="h-full mr-2" />
              My Projects
            </button>
			<label className="btn btn-primary btn-sm rounded-sm text-sm font-bold" htmlFor="modal-3">
            Create Project
          </label>
          </div>
        </div>

        {/* Create Project Button */}
        <div className="absolute bottom-5 right-5 z-20">
          
          <input className="modal-state" id="modal-3" type="checkbox" />
          <div className="modal">
            <label className="modal-overlay"></label>
            <div className="modal-content flex flex-col gap-5">
              <label
                htmlFor="modal-3"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                ref={createProjectRef}
              >
                ✕
              </label>
              <AddBoard createProjectRef={createProjectRef} />
            </div>
          </div>
        </div>

        {/* Outlet/Main Page Content */}
        <div className="flex-1 w-full overflow-x-auto overflow-y-hidden z-0 p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
