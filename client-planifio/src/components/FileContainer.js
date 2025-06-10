import React from 'react';
import pdf from '../assets/pdf.svg';
import word from '../assets/word.png';
import file from '../assets/file.png';

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



const FileContainer = ({ fileUrl, fileType, alt = 'File preview' }) => {
// </a>
const fileName=fileUrl.split("_")[fileUrl.split("_").length-1];
fileUrl="http://localhost:8000/boards/file/"+fileUrl;
  return (<a href={fileUrl} className='flex items-stretch w-full border-2 rounded-md border-solid border-[#494646] p-2 hover:bg-[#494646] transition-all duration-300 ease-in-out' download target="_blank">
  {displayFile({ type: fileType, fileUrl: fileUrl, alt })}
  <div className='ml-2 flex items-start justify-start flex-col'>
    <p className='text-white font-bold'>{fileName}</p>
    <p className='text-xs font-normal text-content2'>{fileType}</p>
  </div>
  </a>)
  
};

export default FileContainer;