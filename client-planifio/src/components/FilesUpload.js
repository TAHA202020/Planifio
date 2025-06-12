import { IoMdAdd } from "react-icons/io";
import FileContainer from "./FileContainer";
import BoardsStore from "../Context/BoardsStore";

export default function FilesUpload({ cardId  ,files}) {
    const addFiletoCard=BoardsStore((state) => state.addFiletoCard);
    console.log("FilesUpload", files);
    const uploadFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cardId', cardId);
        fetch('http://localhost:8000/boards/file/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',

        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('File upload failed');
            }
        }).then(data => {
            let { newFile } = data;
            console.log("New file uploaded:", newFile);
            addFiletoCard(cardId, newFile);
        }).catch(error => {
            console.error('Error uploading file:', error);
        })
        e.target.value = '';
    }


    return (
        <div className="flex items-start flex-col gap-2 w-full max-h-[500px] overflow-y-auto ">
            <input type="file" id={cardId+"fileupload"} className="hidden" onChange={uploadFile} accept=".png,.jpeg,.webp,.gif,.jpg,.pdf,.docx"/>
            {files && files.map((file, index) => (
                <FileContainer key={index} fileUrl={file.name} fileType={file.fileType} id={file.id} cardId={cardId} />
            ))}
            
    </div>
    )
}