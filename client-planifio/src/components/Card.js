import { Draggable } from "@hello-pangea/dnd";
import React, { useRef } from "react";
import { useState } from "react";
import Editor, {
  BtnBold,
  BtnLink,
  BtnRedo,
  BtnUndo,
  BtnUnderline,
  BtnStrikeThrough,
  BtnItalic,
  Toolbar,
} from "react-simple-wysiwyg";
import BoardsStore from "../Context/BoardsStore";
import { GiConfirmed } from "react-icons/gi";
import { MdOutlineCancel } from "react-icons/md";
import { LuClock5 } from "react-icons/lu";
import { BsTextParagraph } from "react-icons/bs";
import FilesUpload from "./FilesUpload";
import ListDropdown from "./ListDropdown";
import { FiLink } from "react-icons/fi";



function Card({ title, cardId, cardIndex, description, dueDate , boardId,listTitle ,files}) {
  const dueDateInputRef = useRef(null);
  const daysLeft = Math.ceil(
    (new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24)
  );
  console.log("description", description);
  const [isEditing, setIsEditing] = useState(false);
  const editDescription = BoardsStore((state) => state.editDescription);
  const [editingDate, seteditingDate] = useState(false);
  const editDueDate = BoardsStore((state) => state.editDueDate);
  const [html, setHtml] = useState(description);
  const modalId = `card-modal-${cardId}`;

  const cardClassdueDate= dueDate && daysLeft < 1 ? "bg-[#f31260]" : dueDate && daysLeft === 1 ? "bg-[#f59e0b]" : "bg-[#3a3a3a]";
  const getItemStyle = (style) => ({
    ...style,
    transitionProperty: "none",
    transitionDuration: "0s",
  });
  const handlechangeDueDate = (newDate) => {
    const letOldDate = dueDate;
    if(newDate === "") 
      newDate = null;
    if (newDate === letOldDate) {
      seteditingDate(false);
      return;
    }
    editDueDate(cardId, newDate ,boardId,listTitle);
    seteditingDate(false);
    fetch("http://localhost:8000/boards/edit/card/due-date", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: cardId,
        DueTime: newDate,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const handlechangeDescription = (cardId, html) => {
    const letOldDescription = description;
    if (html === letOldDescription) {
      setIsEditing(false);
      return;
    }
    editDescription(cardId, html);
    setIsEditing(false);
    fetch("http://localhost:8000/boards/edit/card/description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: cardId,
        Description: html,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const deleteCard=(cardId)=>{
    BoardsStore.getState().deleteCard(cardId);
    fetch("http://localhost:8000/boards/delete/card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: cardId,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  const uploadFiles=(event,cardId)=>{
    console.log(event.target.files);
  }

  return (
    <>
      <input className="modal-state" id={modalId} type="checkbox" />
      <div className="modal  ">
        <label
          className="modal-overlay"
          htmlFor={modalId}
          onClick={() => {
            setIsEditing(false);
            seteditingDate(false);
            setHtml(description);
          }}
        ></label>
        <div className="modal-content flex flex-col gap-5 w-[100vw] md:w-[50vw] h-[80vh] overflow-y-auto relative rounded-md">
          <div className="w-full flex justify-end"><ListDropdown onDelete={()=>deleteCard(cardId)}/></div>
          <div className="flex items-center justify-between gap-2 bg-[#232323] px-2 py-1 rounded-sm">
            <h2 className="text-xl font-bold overflow-hidden text-nowrap"> {title}</h2>
            
            {editingDate ? (
        <div className="flex items-center gap-1">
          <input
            type="datetime-local"
            className="datetime-input outline-none text-sm text-content2 kbd"
            defaultValue={dueDate ? dueDate : ""}
            ref={dueDateInputRef}
          />
          <button
            className="btn btn-sm btn-solid-success"
            onClick={()=>handlechangeDueDate(dueDateInputRef.current.value)}
          >
            <GiConfirmed/>
          </button>
          <button
            className="btn btn-sm btn-solid-error"
            onClick={() => handlechangeDueDate(null)}
          >
            <MdOutlineCancel/>
          </button>
        </div>
      ) : (
        <span
          className=" kbd text-content2 text-sm cursor-pointer"
          onClick={() => seteditingDate(true)}
        >
          {dueDate
            ? formatDate(dueDate)
            : "Add date"}
        </span>
      )}
          </div>
          
          <div>
            <div className=" flex items-center justify-between font-bold text-lg  ">
              <div className="flex items-center gap-2">
                
                <p className="text-lg">Description :</p>
              </div>
              
            </div>
            {!isEditing && <div
              className="bg-[#232323] rounded mt-2 kbd w-full block text-sm cursor-pointer"
              dangerouslySetInnerHTML={{ __html: html==="<br>" || html ==="" || html ==='<div bis_skin_checked="1"><br></div>'? "<i>Click To Add Description</i>" : html }}
              onClick={() => {
                  setHtml(description);
                  setIsEditing(!isEditing);
                }}
            ></div>}
          </div>
          {isEditing && (
            <div className="flex flex-col gap-2">
              <Editor
                style={{ backgroundColor: "#232323" }}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              >
                <Toolbar>
                  <BtnUndo />
                  <BtnRedo />
                  <BtnUnderline />
                  <BtnStrikeThrough />
                  <BtnBold />
                  <BtnItalic />
                </Toolbar>
              </Editor>
              <button
                className="btn btn-solid-success btn-sm rounded-sm"
                onClick={() => handlechangeDescription(cardId, html)}
              >
                {" "}
                save
              </button>

              
            </div>
          )}
          <div>

            <div className="w-full  mb-2 flex items-center justify-between pr-2">
              <h2 className="text-xl font-bold flex items-center gap-2 ">Files :</h2>
              <label htmlFor={cardId+"fileupload"} className="btn btn-primary btn-sm font-normal">+ add file</label>
            </div>
            <FilesUpload cardId={cardId} files={files}/>
          </div>
          
          
        </div>
      </div>

      <Draggable draggableId={cardId} index={cardIndex}>
        {(provided ,snapshot) => (
          <div
            ref={provided.innerRef}
            style={getItemStyle(provided.draggableProps.style)}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >

            <label htmlFor={modalId} className={`${cardClassdueDate} cursor-pointer text-white rounded px-3 py-3 my-1 flex flex-col items-start justify-between w-full gap-2 ${snapshot.isDragging && !snapshot.isDropAnimating?"rotate-[-3deg] z-10":null}`} >
              <div className="text-wrap text-sm w-full break-words whitespace-normal">
                {title}
              </div>
              <div className="flex items-center gap-3 overflow-hidden text-[#d3d3d3]">
                {dueDate && (
                  <div className=" flex items-center gap-1 text-xs">
                    <LuClock5/>
                    <div>
                      {new Date(dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    </div>
                  </div>
                )}
                {description && description!=="<br>" && description!=='<div bis_skin_checked="1"><br></div>' && (<BsTextParagraph/>)}
                {files && files.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{files.length}</span>
                    <FiLink/>
                  </div>
                )}
              </div>
              
            </label>
            
          </div>
        )}
      </Draggable>
    </>
    
  );
}

export default React.memo(Card);
