import React from 'react';
import pdf from '../assets/pdf.svg';
import word from '../assets/word.png';
import file from '../assets/file.png';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import BoardsStore from '../Context/BoardsStore';

function displayFile(file)
{
  
  switch(file.type) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/webp':
    case 'image/gif':
      return (
     <>
      <img src={file.fileUrl} alt={file.alt} className='min-w-[50px] min-h-[50px] w-[50px] h-[50px]  object-contain' />
    </>);
    case 'application/pdf':
      return (
     <>
      <img src={pdf} alt={file.alt} className='min-w-[50px] min-h-[50px] w-[50px] h-[50px]  object-contain' />
    </>);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return (
     <>
      <img src={word} alt={file.alt} className='min-w-[50px] min-h-[50px] w-[50px] h-[50px]  object-contain' />
    </>);
    default:
      return (
     <>
      <img src={file} alt={file.alt} className='min-w-[50px] min-h-[50px] w-[50px] h-[50px]  object-contain' />
    </>);
  }
}



const FileContainer = ({ fileUrl, fileType, alt = 'File preview',id,cardId }) => {
// </a>
const removeFileFromCard= BoardsStore((state) => state.removeFileFromCard);
  const deleteFile = () => {


    fetch("http://localhost:8000/boards/file/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: id,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        removeFileFromCard(cardId, id);

      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }



const fileName=fileUrl.split("_")[fileUrl.split("_").length-1];
fileUrl="http://localhost:8000/boards/file/"+fileUrl;
  return (<div  className='flex items-stretch w-full border-2 rounded-md border-solid border-[#494646] p-2 hover:bg-[#494646] transition-all duration-300 ease-in-out' >
  {displayFile({ type: fileType, fileUrl: fileUrl, alt })}
  <div className='ml-2 flex-1 flex flex-row items-center justify-start '>
    <div className='flex-1'>
      <p className='text-white font-bold'>{fileName}</p>
      <p className='text-xs font-normal text-content2'>{fileType}</p>
    </div>
    <div className='flex items-center gap-2'>
      <a href={fileUrl} className='btn btn-solid-success' download target="_blank"><FiDownload/></a>
      <button className='btn btn-solid-error' onClick={()=>{deleteFile(id)}}><RiDeleteBin6Line/></button>
    </div>
  </div>
  </div>)
  
};

export default FileContainer;