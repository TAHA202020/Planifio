import { create } from 'zustand';

const BoardsStore = create((set) => ({
    boards: [],
    lists: [],
    cards: [],

    setBoardsStore: ({boards, lists, cards}) => set(() => ({
      boards: boards,
      lists: lists,
      cards: cards,
    })),
  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] ,lists: {...state.lists, [board.id]: []}})),
  moveList: (boardId, destinationIndex, sourceIndex) => {
    set((state) => {
      const lists = { ...state.lists };
      const sourceList = lists[boardId];

      // Move the list item within the array
      const [removed] = sourceList.splice(sourceIndex, 1);
      sourceList.splice(destinationIndex, 0, removed);

      // Return updated state
      return { lists };
    });
  },
  

}));

export default BoardsStore;
