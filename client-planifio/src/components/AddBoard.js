import { useState } from "react"
import BoardsStore from "../Context/BoardsStore"
import { useNavigate } from "react-router-dom"



export default function AddBoard({createProjectRef}) {
    const [projectName ,setProjectName] = useState("")
    const addBoard=BoardsStore((state) => state.addBoard)
    const navigate=useNavigate()
    const handleCreateProject = () => 
        {
            fetch("http://localhost:8000/boards/create", {
                body: JSON.stringify({
                    name: projectName
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
                ,credentials: "include"
            })
            .then((res)=>{
                if(res.status===200)
                {
                    return res.json()
                }
                navigate("/authentication")
                
            })
            .then((data)=>
            {
                addBoard({id:data.boardId,name:projectName})
                setProjectName("")
                createProjectRef.current.click()

            })
        }
    return (
        <div className='p-6'>
            <p className='text-sm font-bold'>Create New Board</p>
                <input className="input input-sm input-primary rounded-sm mt-2" placeholder="Board Name" value={projectName} onChange={(e)=>{setProjectName(e.target.value)}} />
                <button className='btn btn-primary btn-sm w-full rounded-sm mt-2' onClick={handleCreateProject}>Create Board</button>
        </div>)
}