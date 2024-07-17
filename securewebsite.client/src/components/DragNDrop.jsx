import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import addFileIcon from './image/addFileIcon.svg';
import Error from './Error';
import './DragNDrop.css';
import { IoHomeOutline } from "react-icons/io5";
import { IoCameraOutline } from "react-icons/io5";



function DragNDrop() {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
        maxFiles: 2,
        accept: {
            "image/png": [".png", ".jpg", '.jpeg']
        },
        onDrop: (acceptedFiles) => {
            setFiles(
                acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }))
            );
        }
    });

    const handleLogout = () => {
        // Implement logout functionality here
        alert('Logged out');
    };

    return (
        <div className="d-flex">
            <div className="vertical-panel bg p-3">
                     <h1 className='loghead'> Logo </h1>
                <div className="mt-5 navbarBTN">

                
                    <button className="btn btn-primary btn-block mb-3">  <IoHomeOutline className="icon" />    Home </button>
                    <button className="btn uplodBTN  btn-block mb-5"><IoCameraOutline className="icon" />  Image Upload  </button>
                </div>
                <button className="btn btn-danger btn-block mt-auto" onClick={handleLogout}>Log Out</button>
            </div>
            <div className="container my-5 open">
                <h1 className="text-center mb-4 UploadHead">Image Upload</h1>
                <div className="card mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="card-body">
                        <div className="mb-4">
                            <label htmlFor="title" className="form-label Imagetitle">Image Title</label>
                            <input
                                type="text"
                                className="form-control imgtil"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-3 botto">
                            <label htmlFor="description" className="form-label ImageDiscription">Image Description</label>
                            <textarea
                                className="form-control discription"
                                id="description"
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div {...getRootProps({ className: "border border-2 border-primary p-4 text-center dropNDrag" })}>
                            <input {...getInputProps()} />
                            <img className="mb-3" src={addFileIcon} alt="add file" style={{ height: '80px' }} />
                            <p>Drag and Drop Files</p>
                            <p>or </p>
                            <button type="button" className="btn btn-primary">Upload</button>
                        </div>

                        <div className="d-flex flex-wrap justify-content-center mt-3">
                            {files.map((file) => (
                                <div className="m-2" key={file.name}>
                                    <img
                                        src={file.preview}
                                        alt="thumbnail"
                                        className="img-thumbnail"
                                        style={{ width: '150px', height: '150px' }}
                                        onLoad={() => {
                                            URL.revokeObjectURL(file.preview);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-3">
                            {acceptedFiles[0] ? <p className="text-success">🙂 Files accepted </p> : ''}
                        </div>

                        <div className="mt-3">
                            {fileRejections[0] ? <Error errorM={fileRejections[0].errors[0]} /> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DragNDrop;
