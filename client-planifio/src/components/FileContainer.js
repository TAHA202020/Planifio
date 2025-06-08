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
     <a href={file.fileUrl} download>
      <img src={file.fileUrl} alt={file.alt} className='w-[100px] h-[100px] object-contain' />
    </a>);
    case 'application/pdf':
      return (
     <a href={file.fileUrl} download>
      <img src={pdf} alt={file.alt} className='w-[100px] h-[100px] object-contain' />
    </a>);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return (
     <a href={file.fileUrl} download>
      <img src={word} alt={file.alt} className='w-[100px] h-[100px] object-contain' />
    </a>);
    default:
      return (
     <a href={file.fileUrl} download>
      <img src={file} alt={file.alt} className='w-[100px] h-[100px] object-contain' />
    </a>);
  }
}



const FileContainer = ({ fileUrl, fileType, alt = 'File preview' }) => {
// </a>
  return (<>
  {displayFile({ type: fileType, fileUrl: fileUrl, alt })}
  </>)
  
};

export default FileContainer;