import { Navigate, useParams } from "react-router-dom";
import BoardsStore from "../Context/BoardsStore";
import AddList from "./AddList";

export default function Lists() {
    const { boardId } = useParams();
    
    const lists = BoardsStore((state) => state.boards.get(boardId)?.lists);
    
    if (!lists) return <Navigate to={"/dashboard"} />;

    const listArray = Array.from(lists.values());
    

    return (
        <>
            <div className=" h-[100vw] flex flex-row items-start justify-start mt-2 overflow-x-auto gap-2">
                {listArray.map((value, index) => {
                    return (
                        <div
                            key={index}
                            className="w-[100px] h-10 bg-[#232323] rounded-md flex items-center justify-start p-2"
                        >
                            {value.title}
                        </div>
                    );
                })}
                <AddList boardId={boardId}/>
            </div>
        </>
    );
}
