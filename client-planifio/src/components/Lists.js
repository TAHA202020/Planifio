import { Navigate, useParams } from "react-router-dom";
import BoardsStore from "../Context/BoardsStore";
import { useState } from "react";

export default function Lists() {
    const [newListName, setNewListName] = useState("");
    const { boardId } = useParams();
    const addList = BoardsStore((state) => state.addList);

    // Access the board's lists using .get() safely with optional chaining
    const board = BoardsStore((state) => state.boards.get(boardId));
    const lists = board?.lists;

    if (!lists) return <Navigate to={"/dashboard"} />; // If no lists, navigate away

    const listArray = Array.from(lists.values()); // Convert the map to an array for iteration

    const createList = () => {
        setNewListName(""); // Reset the input value
        fetch("http://localhost:8000/boards/lists/create", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            method: "POST",
            body: JSON.stringify({
                boardId: boardId,
                title: newListName,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    const newList = {
                        id: data.listId,
                        title: data.title,
                        position: data.position,
                        cards: new Map(),
                    };

                    addList(boardId, newList); // Call the addList function from the store
                } else {
                    alert("Error creating list");
                }
            });
    };

    return (
        <>
            <div className="w-full h-full flex flex-row items-center justify-start mt-2">
                {listArray.map((value, index) => {
                    return (
                        <div
                            key={index}
                            className="w-[100px] h-10 bg-[#232323] rounded-md flex items-center justify-start p-2"
                        >
                            {value.title}
                        </div>
                    );
                })}
                <div className="flex flex-row items-center justify-start gap-2 p-2 bg-[#232323] rounded-md">
                    <input
                        className="input input-sm rounded-sm"
                        placeholder="ListName"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <button
                        className="btn btn-primary rounded-lg btn-sm"
                        onClick={createList}
                    >
                        +
                    </button>
                </div>
            </div>
        </>
    );
}
