import { useNavigate } from "react-router-dom";
import BoardsStore from "../Context/BoardsStore"; // Assuming you've exported `useStore` from your Zustand store

export default function BoardsMenu({overlayRef}) {
  const navigate = useNavigate();
  
  // Correctly using `useStore` to subscribe to the `boards` state
  const boards = BoardsStore((state) => state.boards);
  console.log(boards); // This should log the boards array

  return (
    <ul className="menu-items">
      {boards.map((board) => (
        <li
          key={board.id}
          onClick={() => {
            navigate(`/dashboard/${board.id}`);
            overlayRef.current.click(); // Close the overlay when a board is clicked
          }}
          className="menu-item rounded-none"
        >
          {board.name}
        </li>
      ))}
    </ul>
  );
}