
import { useEffect, useRef,useState} from 'react'
import {isAuthenticated} from "../Utils/Auth"
import {Outlet, useNavigate} from 'react-router-dom'
import user from "../assets/user.svg"
import BoardsStore from '../Context/BoardsStore'
import BoardsMenu from './BoardsMenu'
import AddBoard from './AddBoard'
export default function Dashboard({}) 
{
    const createProjectRef=useRef(null)
    const overlayRef=useRef(null)
    const [Loading, setLoading] = useState(true)
    const navigate=useNavigate()
    const isAuth = isAuthenticated()
    const setBoardsStore=BoardsStore((state) => state.setBoardsStore)
    function transformBackendData(backendBoards) {
        const boards = [];
        const lists = {};
        const cards = {};
      
        backendBoards.forEach(board => {
          boards.push({
            id: board.id,
            name: board.name || '',
          });
      
          lists[board.id] = board.lists.map(list => {
            const cardIds = list.cards.map(card => {
              cards[card.id] = {
                id: card.id,
                title: card.title,
                description: card.description || '',
              };
              return card.id;
            });
      
            return {
              id: list.id,
              title: list.title,
              cardIds: cardIds,
            };
          });
        });
      
        return { boards, lists, cards };
      }
      
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
                    setBoardsStore(transformBackendData(data.boards))
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
                                <AddBoard createProjectRef={createProjectRef}/>
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
                            <BoardsMenu overlayRef={overlayRef}/>                        
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