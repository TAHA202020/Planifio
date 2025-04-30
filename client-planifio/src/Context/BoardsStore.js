import { create } from 'zustand';

const BoardsStore = create((set) => ({
  boards: [],
  lists: {},
  cards: {}, // Cards are stored as a dictionary with card ID as key

  setBoardsStore: ({ boards, lists, cards }) => {
    console.log(cards)
    return set(() => ({
      boards,
      lists,
      cards,
    }));
  },

  addBoard: (board) => set((state) => ({
    boards: [...state.boards, board],
    lists: { ...state.lists, [board.id]: [] },
  })),
  createList:(boardId, newList) => set((state) => {
    const newLists = [...state.lists[boardId]]; // clone the lists array
    newLists.push(newList); // add the new list
  
    return {
      lists: {
        ...state.lists,
        [boardId]: newLists, // updated board lists
      },
    };


  })
  ,
  moveList: (boardId, destinationIndex, sourceIndex) => {
    set((state) => {
      const lists = { ...state.lists };
      const sourceList = lists[boardId];

      // Move the list item within the array
      const [removed] = sourceList.splice(sourceIndex, 1);
      sourceList.splice(destinationIndex, 0, removed);

      return { lists };
    });
  },

  moveCard: (sourceListId, destinationListId, sourceIndex, destinationIndex, boardId) => {
    set((state) => {
      const lists = { ...state.lists };
      const findLists = (lists, sourceListId, destinationListId) => {
        let sourceList = null;
        let destinationList = null;
      
        // Iterate once to find both lists
        for (let i = 0; i < lists.length; i++) {
          const list = lists[i];
          if (list.id === sourceListId) {
            sourceList = list;
          }
          if (list.id === destinationListId) {
            destinationList = list;
          }
          // If both lists are found, no need to continue
          if (sourceList && destinationList) break;
        }
      
        return { sourceList, destinationList };
      };
      
      // Usage:
      const { sourceList, destinationList } = findLists(lists[boardId], sourceListId, destinationListId);
  
      // Clone cardIds arrays
      const newSourceCardIds = sourceList.cardIds;
      const newDestinationCardIds = destinationList.cardIds;
  
      // Remove from source
      const [removedCardId] = newSourceCardIds.splice(sourceIndex, 1);
  
      // Insert into destination
      newDestinationCardIds.splice(destinationIndex, 0, removedCardId);
  
      // Update the lists
      return {
        lists: {
          ...lists,
          [sourceListId]: {
            ...sourceList,
            cardIds: newSourceCardIds,
          },
          [destinationListId]: {
            ...destinationList,
            cardIds: newDestinationCardIds,
          },
        },
      };
    });
  },

  addCard: (boardId, newCard, listIndex) => set((state) => {
    const newLists = [...state.lists[boardId]]; // clone the lists array
    const updatedList = { ...newLists[listIndex] }; // clone the specific list
    updatedList.cardIds = [...updatedList.cardIds, newCard.id]; // clone + add card id
    newLists[listIndex] = updatedList; // replace list with updated one
  
    return {
      lists: {
        ...state.lists,
        [boardId]: newLists, // updated board lists
      },
      cards: {
        ...state.cards,
        [newCard.id]: newCard, // add new card
      },
    };
  }),
  editDescription: (cardId, newDescription) => set((state) => {
    const updatedCard = { ...state.cards[cardId], description: newDescription };
    return {
      cards: {
        ...state.cards,
        [cardId]: updatedCard,
      },
    };
  }),
  editDueDate: (cardId, newDueDate) => set((state) => {
    const updatedCard = { ...state.cards[cardId], dueDate: newDueDate };
    return {
      cards: {
        ...state.cards,
        [cardId]: updatedCard,
      },
    };
  })
  
}));

export default BoardsStore;
