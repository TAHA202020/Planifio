import { create } from 'zustand'

const BoardsStore = create((set) => ({
  boards: [],
  setBoards: (newBoards) => set({ boards: newBoards }),
}))
  
export default BoardsStore