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

      return { boards: updatedBoards };
    }),

  updateListPosition: (boardId, fromIndex, toIndex) =>
    set((state) => {
      const updatedBoards = new Map(state.boards);
      const board = updatedBoards.get(boardId);
      if (!board) return {};

      const listArray = Array.from(board.lists.values());
      const [movedList] = listArray.splice(fromIndex, 1);
      listArray.splice(toIndex, 0, movedList);

      // Update position values
      listArray.forEach((list, index) => {
        list.position = index;
      });

      const updatedLists = new Map();
      for (const list of listArray) {
        updatedLists.set(list.id, list);
      }

      updatedBoards.set(boardId, {
        ...board,
        lists: updatedLists,
      });

      return { boards: updatedBoards };
    }),

  updateCardPosition: (
    boardId,
    sourceListId,
    destinationListId,
    fromIndex,
    toIndex,
    cardId
  ) =>
    set((state) => {
      const updatedBoards = new Map(state.boards);
      const board = updatedBoards.get(boardId);
      if (!board) return {};

      const sourceList = board.lists.get(sourceListId);
      const destinationList = board.lists.get(destinationListId);
      if (!sourceList || !destinationList) return {};

      const sourceCards = Array.from(sourceList.cards.values());
      const [movedCard] = sourceCards.splice(fromIndex, 1);

      if (!movedCard) return {};

      if (sourceListId === destinationListId) {
        sourceCards.splice(toIndex, 0, movedCard);
        sourceCards.forEach((card, index) => {
          card.position = index;
        });

        const newCardMap = new Map();
        for (const card of sourceCards) {
          newCardMap.set(card.id, card);
        }

        sourceList.cards = newCardMap;
      } else {
        const destinationCards = Array.from(destinationList.cards.values());
        destinationCards.splice(toIndex, 0, movedCard);

        sourceCards.forEach((card, index) => {
          card.position = index;
        });
        destinationCards.forEach((card, index) => {
          card.position = index;
        });

        const newSourceMap = new Map();
        for (const card of sourceCards) {
          newSourceMap.set(card.id, card);
        }

        const newDestMap = new Map();
        for (const card of destinationCards) {
          newDestMap.set(card.id, card);
        }

        sourceList.cards = newSourceMap;
        destinationList.cards = newDestMap;
      }

      updatedBoards.set(boardId, {
        ...board,
        lists: new Map(board.lists),
      });

      return { boards: updatedBoards };
    }),
}));

export default BoardsStore;
