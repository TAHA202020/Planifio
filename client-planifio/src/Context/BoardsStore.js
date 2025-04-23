import { create } from 'zustand';

const BoardsStore = create((set) => ({
  boards: new Map(),

  setBoards: (newBoards) => set({ boards: newBoards }),

  addList: (boardId, newList) =>
    set((state) => {
      const updatedBoards = new Map(state.boards);
      const board = updatedBoards.get(boardId);

      if (!board) return {}; 

      const updatedLists = new Map(board.lists);
      updatedLists.set(newList.id, { ...newList });
      
      updatedBoards.set(boardId, {
        ...board,
        lists: updatedLists,
      });

      return { boards: updatedBoards }; // Return new state object
    }),
}));

export default BoardsStore;