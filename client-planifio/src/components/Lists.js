import { useContext } from "react"
import { Navigate, useParams } from "react-router-dom"
import { BoardsContext } from "../Context/BoardsContext"


export default function Lists() 
{
    const { Boards } = useContext(BoardsContext)
    const { boardId } = useParams()
    const board = Boards.find((board) => board.id === boardId)
    if (board==undefined || board==null) {
        return <Navigate to="/dashboard" />
    }
    return <>
        <div className="w-full h-full flex flex-col items-center justify-center">
        </div>
    </>
}