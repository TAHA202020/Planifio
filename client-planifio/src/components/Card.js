import { Draggable } from "@hello-pangea/dnd";
import React, { useRef } from "react";
import { useState } from "react";
import { MdOutlineDateRange } from "react-icons/md";
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
import { MdOutlineDescription } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineMenuOpen } from "react-icons/md";
import BoardsStore from "../Context/BoardsStore";




function Card({ title, cardId, cardIndex, description, dueDate }) {
  const dueDateInputRef = useRef(null);
  const daysLeft = Math.ceil(
    (new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const [isEditing, setIsEditing] = useState(false);
  const editDescription = BoardsStore((state) => state.editDescription);
  const [editingDate, seteditingDate] = useState(false);
  const editDueDate = BoardsStore((state) => state.editDueDate);
  const [html, setHtml] = useState(description);
  const modalId = `card-modal-${cardId}`;

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
    editDueDate(cardId, newDate);
    seteditingDate(false);
    fetch("http://localhost:8000/boards/edit/card/due-date", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        Id: cardId,
        DueTime: newDate,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
      });
  };
  return (
    <>
      <input className="modal-state" id={modalId} type="checkbox" />
      <div className="modal ">
        <label
          className="modal-overlay"
          htmlFor={modalId}
          onClick={() => {
            setIsEditing(false);
            setHtml(description);
          }}
        ></label>
        <div className="modal-content flex flex-col gap-5 w-[50vw]">
          <label
            htmlFor={modalId}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {
              setIsEditing(false);
              setHtml(description);
            }}
          >
            ✕
          </label>
          <h2 className="text-xl font-bold"> {title}</h2>
          <div className="flex items-center gap-2">
  <div className="alert alert-info p-2 rounded">
    <div className="flex flex-row items-center gap-1">
      <MdOutlineDateRange />
      <span className="text-sm">Due date :</span>
      {editingDate ? (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            className="outline-none text-sm text-content2"
            defaultValue={dueDate ? dueDate : ""}
            ref={dueDateInputRef}
          />
          <button
            className="btn btn-sm btn-solid-success"
            onClick={()=>handlechangeDueDate(dueDateInputRef.current.value)}
          >
            Confirm
          </button>
          <button
            className="btn btn-sm btn-solid-error"
            onClick={() => handlechangeDueDate(null)}
          >
            remove
          </button>
        </div>
      ) : (
        <span
          className="text-content2 text-sm cursor-pointer"
          onClick={() => seteditingDate(true)}
        >
          {dueDate
            ? new Date(dueDate).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Click to add due date"}
        </span>
      )}
    </div>
  </div>
</div>
          <div class="divider m-0"></div>
          <div>
            <div className="bg-[#232323] flex items-center justify-between font-bold text-lg  ">
              <div className="flex items-center gap-2">
                <MdOutlineDescription />
                <p>description</p>
              </div>
              <button
                className="btn btn-solid-warning btn-sm rounded-sm outline-none"
                onClick={() => {
                  setHtml(description);
                  setIsEditing(!isEditing);
                }}
              >
                {" "}
                <FaRegEdit />
              </button>
            </div>
            <div
              className="bg-[#232323] rounded mt-2 kbd w-full block text-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>
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
                  <BtnLink />
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
              <div>
                {title}
                {dueDate &&
                  (daysLeft === 1 ? (
                    <span className="badge badge-xs ml-2 badge-warning">
                      {">24h left"}
                    </span>
                  ) : daysLeft < 1 ? (
                    <span className="badge badge-xs ml-2  badge-error">
                      Overdue
                    </span>
                  ) : (
                    <span className="badge  badge-xs ml-2 badge-secondary">
                      {daysLeft} days left
                    </span>
                  ))}
              </div>

              <label
                className="btn btn-solid-default btn-sm cursor-pointer"
                htmlFor={modalId}
              >
                <MdOutlineMenuOpen />
              </label>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
}

export default React.memo(Card);
