import { Navigate, useParams } from "react-router-dom";
import BoardsStore from "../Context/BoardsStore";
import AddList from "./AddList";

export default function Lists() {
    const { boardId } = useParams();
    
    const lists = BoardsStore((state) => state.boards.get(boardId)?.lists);
    
    if (!lists) return <Navigate to={"/dashboard"} />;

    const listArray = Array.from(lists.values());
    

    return (
            <div className="flex flex-row items-start justify-start mt-2 overflow-x-auto gap-5 h-full">
                {listArray.map((value, index) => {
                    return (
                        <div
                            key={index}
                            className="min-w-[300px] w-[300px] h-10 bg-[#232323] rounded-md flex items-center justify-start p-2"
                        >
                            {value.title}
                        </div>
                    );
                })}
                <AddList boardId={boardId}/>
            </div>
    );
}
