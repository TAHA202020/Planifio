import { useState } from "react";
import BoardsStore from "../Context/BoardsStore";
import React from "react";
function AddList({ boardId }) {
    const addList = BoardsStore((state) => state.createList);
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
                        id: data.list.id,
                        title: data.list.title,
                        cardIds: [],
                    };
                    addList(data.list.boardId, newList);
                } else {
                    alert("Error creating list");
                }
            });
    };
const [newListName, setNewListName] = useState("");
return (<div className="min-w-[300px] w-[300px] flex flex-row items-center justify-start gap-2 p-2 bg-[#232323] rounded-md">
    <input
        className="input input-sm rounded-sm"
        placeholder="Ajouter une autre liste"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
    />
    <button
        className="btn btn-primary rounded-lg btn-sm"
        onClick={createList}
    >
        +
    </button>
</div>)
}
export default React.memo(AddList);