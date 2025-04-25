import { Navigate, useParams } from "react-router-dom";
import BoardsStore from "../Context/BoardsStore";
import AddList from "./AddList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Lists() {
  const { boardId } = useParams();
  const lists = BoardsStore((state) => state.boards.get(boardId)?.lists);
  const updateListPosition = BoardsStore((state) => state.updateListPosition);

  if (!lists) return <Navigate to="/dashboard" />;

  const listArray = Array.from(lists.values()).sort((a, b) => a.position - b.position);

  const handleDragEnd = async (result) => {
  const { source, destination, type, draggableId } = result;
  if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
  const { index: sourceIndex, droppableId: sourceDroppableId } = source;
  const { index: destIndex, droppableId: destDroppableId } = destination;

  const updatedPositionToSend = {
    BoardId: boardId, // The ID of the board being dragged
    ListId: draggableId, // The list ID being dragged
    NewPosition: destIndex, // The new position of the list
  };
const oldState = new Map(BoardsStore.getState().boards);
  updateListPosition(boardId, sourceIndex, destIndex);
  try {
      const res = await fetch("http://localhost:8000/boards/validate-drag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${localStorage.getItem("token")}` ,
        },
        body: JSON.stringify(updatedPositionToSend),
      });
  
      const data = await res.json();
  
      if (data.success) {
        console.log("Position updated successfully.");
        // Update the store with the updated boards data from the backend response
        return ;
      } else {
        console.error("Failed to update position:", data.message);
        // Revert the UI to the old state if the backend validation fails
        BoardsStore.setState({ boards: oldState });
      }
    } catch (error) {
      console.error("Error while validating position:", error);
      // Revert the UI to the old state if there's an error in the backend request
      BoardsStore.setState({ boards: oldState });
    }
};
  

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="LIST">
        {(provided) => (
          <div
            className="flex flex-row items-start justify-start mt-2 overflow-x-auto gap-5 h-full"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {listArray.map((list, listIndex) => {
              const cardArray = Array.from(list.cards.values()).sort(
                (a, b) => a.position - b.position
              );

              return (
                <Draggable draggableId={list.id} index={listIndex} key={list.id}>
                  {(provided) => (
                    <div
                      className="min-w-[300px] w-[300px] bg-[#232323] rounded-md p-2 flex flex-col gap-2"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="font-bold text-white mb-2" {...provided.dragHandleProps}>
                        {list.title}
                      </div>

                      <Droppable droppableId={list.id} type="CARD">
                        {(provided) => (
                          <div
                            className="flex flex-col gap-2"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {cardArray.map((card, cardIndex) => (
                              <Draggable draggableId={card.id} index={cardIndex} key={card.id}>
                                {(provided) => (
                                  <div
                                    className="bg-[#3a3a3a] text-white rounded px-2 py-1"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {card.title}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
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
