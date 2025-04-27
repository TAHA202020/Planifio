import { useParams, Navigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from "./AddList"; // Assuming you have an AddList component
import BoardsStore from "../Context/BoardsStore"; // Assuming useStore is exported from your store
import React from "react"; // Import React for React.memo

export default function Lists() {
  const { boardId } = useParams();
  const lists = BoardsStore((state) => state.lists[boardId]);
  const moveList = BoardsStore((state) => state.moveList); // Function to update list positions in Zustand

  if (!lists) {
    return <Navigate to="/dashboard" />;
  }

  console.log("rerendered");

  const handleDragEnd = (result) => {
    const { destination, source } = result;

    // If dropped outside or no change in position, do nothing
    if (!destination || destination.index === source.index) return;

    // Directly mutate the list state for better performance
    moveList(boardId, destination.index, source.index);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto overflow-x-hidden">
      {/* DragDropContext handles the drag-and-drop process */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lists" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex overflow-x-auto"  // Added space-x-4 for margin between items
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={list.id} index={index}>
                  {(provided) => (
                    <MemoizedList
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      list={list}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* AddList Component (non-draggable, placed in the same row) */}
              <div className="flex-shrink-0">
                <AddList boardId={boardId} />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

// Memoized version of the list item component
const MemoizedList = React.memo(({ list, ...props }) => {
  return (
    <div {...props} className="p-4 border bg-gray-100 rounded-md m-2 text-black">
      <h3>{list.title}</h3>
      {/* You can render the cards for each list if needed */}
      {/* list.cards.map(...) */}
    </div>
  );
});
