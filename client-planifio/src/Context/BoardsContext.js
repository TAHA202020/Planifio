import { createContext, useState } from "react";

export const BoardsContext = createContext()


export const BoardsProvider = ({ children }) => {
    const [Boards,setBoards] = useState([])

    return (
        <BoardsContext.Provider value={{ Boards, setBoards }}>
            {children}
        </BoardsContext.Provider>
    )
}
