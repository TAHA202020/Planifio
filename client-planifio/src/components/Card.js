import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { DefaultEditor } from "react-simple-wysiwyg";
import { MdOutlineDescription } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import BoardsStore from "../Context/BoardsStore";
export default function Card({ title, cardId, cardIndex, description}) {
  const [isEditing, setIsEditing] = useState(false);
  const editDescription=BoardsStore((state) => state.editDescription);
  const [html, setHtml] = useState(description);
  const modalId = `card-modal-${cardId}`;
  const getItemStyle = (style) => ({
    ...style,
    transitionProperty: "none",
    transitionDuration: "0s",
  });
  const handlechangeDescription=(cardId, html)=>{
    const letOldDescription=description;
    editDescription(cardId, html)
    setIsEditing(false)
    console.log(html)
    fetch("http://localhost:8000/boards/edit/card/description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        Id: cardId,
        Description: html,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
    })
  }
  return (
    <>
      <input className="modal-state" id={modalId} type="checkbox" />
      <div className="modal ">
        <label className="modal-overlay" htmlFor={modalId} onClick={()=>{setIsEditing(false);setHtml(description)}}></label>
        <div className="modal-content flex flex-col gap-5 w-[50vw]">
          <label
            htmlFor={modalId}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={()=>{setIsEditing(false);setHtml(description)}}
          >
            ✕
          </label>
          <h2 className="text-xl"> {title}</h2>

          <div>
            <div className="bg-[#232323] flex items-center justify-between font-bold text-lg  ">
                <div className="flex items-center gap-2">
                  <MdOutlineDescription/>
                  <p>description</p>
                </div> 
              <button className="btn btn-solid-warning btn-sm rounded-sm" onClick={()=>{
                setHtml(description)
                setIsEditing(!isEditing)

              }}> <FaRegEdit /></button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: html }}></div>
          </div>{isEditing && (<div className="flex flex-col gap-2">
          <DefaultEditor
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <button className="btn btn-solid-success btn-sm rounded-sm" onClick={()=>handlechangeDescription(cardId,html)}> save</button>
          </div>)}
        </div>
      </div>

      <Draggable draggableId={cardId} index={cardIndex}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            style={getItemStyle(provided.draggableProps.style)}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="bg-[#3a3a3a] text-white rounded px-3 py-3 my-1 flex items-center justify-between">
              <div>{title}</div>
              
              <label className="btn btn-sm cursor-pointer" htmlFor={modalId}>
                open
              </label>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
}

