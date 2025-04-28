import { useParams, Navigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from "./AddList";
import AddCard from "./AddCard";
import BoardsStore from "../Context/BoardsStore";
import React from "react";

export default function Lists() {
  const { boardId } = useParams();
  const lists = BoardsStore((state) => state.lists[boardId]);
  const cards = BoardsStore((state) => state.cards);
  const moveList = BoardsStore((state) => state.moveList);
  const moveCard = BoardsStore((state) => state.moveCard);

  if (!lists) {
    return <Navigate to="/dashboard" />;
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside or no change, do nothing
    if (!destination || (destination.index === source.index && destination.droppableId === source.droppableId)) {
      return;
    }

    if (type === "LIST") {
      // Handle list reordering
      moveList(boardId, destination.index, source.index);
      fetch("http://localhost:8000/boards/list/validate-drag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },
        body: JSON.stringify({
          boardId: boardId,
          ListId: draggableId,
          NewPosition: destination.index,
        }),
      })
      .then((response) => response.json()).then((data) => {
        if(data.status!="success")
          {
            moveList(boardId, source.index, destination.index);
          }
      }).catch((error) => {
        moveList(boardId, source.index, destination.index);
      });
    } else if (type === "CARD") {
      // Handle card movement
      const sourceListId = source.droppableId;
      const destinationListId = destination.droppableId;

      moveCard(sourceListId, destinationListId, source.index, destination.index,boardId );
      try {
        const response = await fetch('http://localhost:8000/boards/cards/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            boardId,
            sourceListId,
            destinationListId,
            sourceIndex: source.index,
            destinationIndex: destination.index,
          }),
        });

        if (!response.ok) {
          moveCard(destinationListId, sourceListId, destination.index, source.index,boardId );
        }
        const data = await response.json();
        console.log("Move card response", data);
        // Server accepted, nothing to do
      } catch (error) {
        console.error("Move card failed, reverting", error);
        // Revert the move in the local state
        moveCard(destinationListId, sourceListId, destination.index, source.index,boardId );
      }
    }
  };
  const getItemStyle = (style) => ({
    ...style,
    transitionProperty: "none",
    transitionDuration: "0s",
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="LIST" >
        {(provided) => (
          <div
            className="flex flex-row items-start justify-start mt-2 overflow-x-auto h-full "
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {lists.map((list, listIndex) => {
              return (
                <Draggable draggableId={list.id} index={listIndex} key={list.id}>
                  {(provided) => (
                    <div
                      className="min-w-[300px] w-[300px] bg-[#232323] rounded-md p-2 flex flex-col mx-[10px]"
                      ref={provided.innerRef}
                      style={getItemStyle(provided.draggableProps.style)}
                      {...provided.draggableProps}
                    >
                      <div className="font-bold text-white mb-2" {...provided.dragHandleProps}>
                        {list.title}
                      </div>
                      <Droppable droppableId={list.id} type="CARD">
                        {(provided) => (
                          <div
                            className="flex flex-col h-full min-h-[50px]"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {list.cardIds &&
                              list.cardIds.map((card, cardIndex) => {
                                card = cards[card];
                                if (!card) return null;
                                return (
                                  <Draggable draggableId={card.id} index={cardIndex} key={card.id}>
                                  {(provided , snapshot) => (
                                    <div
                                      className="bg-[#3a3a3a] text-white rounded px-2 py-1"
                                      ref={provided.innerRef}
                                      style={getItemStyle(provided.draggableProps.style)}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {card.title}
                                    </div>
                                  )}
                                </Draggable>
                                );
                              })}
                            {provided.placeholder}
                            <AddCard boardId={boardId} listId={list.id} listIndex={listIndex}/>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            <AddList boardId={boardId} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}


