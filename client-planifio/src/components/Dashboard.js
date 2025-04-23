
import { useEffect, useRef,useState,useContext} from 'react'
import {isAuthenticated} from "../Utils/Auth"
import {Outlet, useNavigate} from 'react-router-dom'
import user from "../assets/user.svg"
import BoardsStore from '../Context/BoardsStore'
export default function Dashboard() 
{
    const createProjectRef=useRef(null)
    const overlayRef=useRef(null)
    const [Loading, setLoading] = useState(true)
    const navigate=useNavigate()
    const isAuth = isAuthenticated()
    const [projectName ,setProjectName] = useState("")
    const Boards=BoardsStore((state) => state.boards)
    const setBoards=BoardsStore((state) => state.setBoards)
    const transformNestedBoardData = (boardsFromBackend) => {
        const boards = new Map();
      
        for (const board of boardsFromBackend) {
          const listMap = new Map();
      
          for (const list of board.lists) {
            const cardMap = new Map();
      
            for (const card of list.cards) {
              cardMap.set(card.id, {
                id: card.id,
                title: card.title,
                description: card.description,
                position: card.position,
              });
            }
      
            listMap.set(list.id, {
              id: list.id,
              title: list.title,
              position: list.position,
              cards: cardMap,
            });
          }
          
          boards.set(board.id, {
            id: board.id,
            name: board.name,
            lists: listMap,
          });
        }
        return boards;
      };
      
    const loadData=async ()=>
    {
        try{
            const res=await fetch("http://localhost:8000/boards/get", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            if(res.status===200)
                {
                    const data=await res.json()
                    console.log(data)
                    setBoards(transformNestedBoardData(data.boards))
                    setLoading(false)
                }
                else if(res.status===401)
                {
                    localStorage.removeItem("token")
                    navigate("/authentication")
                }
        }catch (error) {
            console.log("Error fetching boards:", error)
        }
        
        
    }
    useEffect(()=>
        {
            if(!isAuth) {
                navigate("/authentication")
                return
            }
            loadData()
        
        },[])

    const handleCreateProject = () => 
    {
        fetch("http://localhost:8000/boards/create", {
            body: JSON.stringify({
                name: projectName
            }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then((res)=>{
            if(res.status===200)
            {
                createProjectRef.current.click()
                return res.json()
            }
            navigate("/authentication")
            
        })
        .then((data)=>
        {
            console.log(data)
            setBoards((prevBoards)=>[...prevBoards,{id:data.boardId,name:projectName,lists:[]}])
            setProjectName("")
        })
    }
    if(Loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        )
    }
    return (<div className='flex flex-col h-[100vh]'>
    <div className='absolute bottom-5 right-5'>
    <label className="btn btn-primary rounded-md" htmlFor="modal-3">Create Project</label>
                        <input className="modal-state" id="modal-3" type="checkbox" />
                        <div className="modal">
                            <label className="modal-overlay"></label>
                            <div className="modal-content flex flex-col gap-5">
                                <label htmlFor="modal-3" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" ref={createProjectRef} >✕</label>
                                {/* <!-- Put modal content here --> */}
                                <div className='p-6'>
                                    <p className='text-sm font-bold'>Create New Project</p>
                                    <input className="input input-sm input-primary rounded-sm mt-2" placeholder="Project Name" value={projectName} onChange={(e)=>{setProjectName(e.target.value)}} />
                                    <button className='btn btn-primary btn-sm w-full rounded-sm mt-2' onClick={handleCreateProject}>Create Project</button>
                                </div>
                                
                            </div>
                        </div>
    </div>
    <div className='px-7 py-3 bg-[#232323] flex justify-between items-center'>
        <div className='flex items-center gap-5'>
        
            <input type="checkbox" id="drawer-left" className="drawer-toggle" />

            <label htmlFor="drawer-left" className="btn btn-solid-primary rounded-md">Projects</label>
            <label className="overlay" htmlFor="drawer-left" ref={overlayRef}></label>
            <div className="drawer">
                <div className="drawer-content p-0">
                    <nav className="menu bg-gray-2 rounded-md mt-5">
                        <section className="menu-section">
                            <ul className="menu-items">
                                {Array.from(Boards.values()).map((board)=><li key={board.id} onClick={()=>{overlayRef.current.click();navigate(`/dashboard/${board.id}`)}} className="menu-item rounded-none">{board.name}</li>)}
                            </ul>
                        </section>
                    </nav>
                    
                </div>
            </div>
        
        </div>
        <div className="avatar avatar-ring-primary bg-zinc-200 avatar-sm ">
            <img src={user} alt="avatar" />
        </div>
    </div>
    <div className='flex-auto w-[100vw] p-[10px]'>
        <Outlet/>
    </div>
    </div>)
}