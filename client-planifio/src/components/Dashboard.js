import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "../Utils/Auth";
import { Outlet, useNavigate } from "react-router-dom";
import user from "../assets/user.svg";
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
    console.log(backendBoards);
    const boards = [];
    const lists = {};
    const cards = {};

    backendBoards.forEach((board) => {
      boards.push({
        id: board.id,
        name: board.name || "",
      });

      lists[board.id] = board.lists.map((list) => {
        const cardIds = list.cards.map((card) => {
          cards[card.id] = {
            id: card.id,
            title: card.title,
            description: card.description || "",
            dueDate: card.dueTime || null,
          };
          return card.id;
        });

        return {
          id: list.id,
          title: list.title,
          cardIds: cardIds,
        };
      });
    });

    return { boards, lists, cards };
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

  if (Loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="sticky flex h-screen flex-row w-screen">
      <aside className="sidebar h-full justify-start">
        <section className="sidebar-content h-fit min-h-[20rem] overflow-visible">
          <BoardsMenu />
        </section>
        <section class="sidebar-footer h-full justify-end bg-gray-2 pt-2">
          <button className="btn btn-primary rounded-sm" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </aside>
      <div className="flex-grow flex flex-col h-[100vh] min-w-0">
        <div className="absolute bottom-5 right-5">
          <label className="btn btn-primary rounded-md" htmlFor="modal-3">
            Create Project
          </label>
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
        <div className="px-7 py-3 bg-[#232323] flex justify-between items-center">
          <div className="flex items-center justify-between gap-5 w-full">
            <div className="logo"></div>
            <p>d,zlkdf</p>
          </div>
        </div>
        <div className="flex-auto w-full overflow-x-auto overflow-y-hidden">
            <Outlet /> 
        </div>
      </div>
    </div>
  );
}
