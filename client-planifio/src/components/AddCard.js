import { useState } from "react";
import BoardsStore from "../Context/BoardsStore";
import React from "react";

function AddCard({ boardId, listId,listIndex }) {
  const addCard = BoardsStore((state) => state.addCard);

  const createCard = () => {
    if (!newCardName.trim()) return;

    setNewCardName(""); // Reset the input field

    fetch("http://localhost:8000/boards/cards/create", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        listId: listId,
        title: newCardName,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const newCard = {
            id: data.card.id,
            title: data.card.title,
            listId: listId,
          };
          addCard(boardId, newCard, listIndex);
        } else {
          alert("Error creating card");
        }
      });
  };

  const [newCardName, setNewCardName] = useState("");

  return (
    <div className="flex flex-row items-center gap-2 mt-2 ">
      <input
        className="input input-sm rounded-sm"
        placeholder="Ajouter une autre carte"
        value={newCardName}
        onChange={(e) => setNewCardName(e.target.value)}
      />
      <button
        className="btn btn-primary btn-sm rounded-lg"
        onClick={createCard}
      >
        +
      </button>
    </div>
  );
}

export default React.memo(AddCard);