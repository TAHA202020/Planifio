import { create } from 'zustand';

const BoardsStore = create((set) => ({
  boards: new Map(),

  setBoards: (newBoards) => set({ boards: newBoards }),

  addList: (boardId, newList) =>
    set((state) => {
      const updatedBoards = new Map(state.boards); // Clone the boards map
      const board = updatedBoards.get(boardId);

      if (!board) return {}; // board not found

      // Clone the lists map for that board
      const updatedLists = new Map(board.lists);

      // Add new list to the board's list map
      updatedLists.set(newList.id, { ...newList });

      // Create a new board object with the updated lists map
      updatedBoards.set(boardId, {
        ...board,
        lists: updatedLists,
      });

      return { boards: updatedBoards }; // Return new state object
    }),
}));

export default BoardsStore;