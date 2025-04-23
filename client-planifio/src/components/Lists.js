import { Navigate, useParams } from "react-router-dom"
import BoardsStore from "../Context/BoardsStore"

export default function Lists() 
{
    
    const { boardId } = useParams()
    const Boards=BoardsStore((state) => state.boards)
    const board = Boards.get(boardId)
    if (board==undefined || board==null) {
        return <Navigate to="/dashboard" />
    }
    const lists = board.lists
    const listArray = Array.from(lists.values())
    return <>
        <div className="w-full h-full flex flex-col items-center justify-center">
            
        </div>
    </>
}