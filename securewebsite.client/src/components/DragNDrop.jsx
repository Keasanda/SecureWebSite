import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import addFileIcon from './image/addFileIcon.svg';
import Error from './Error';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import './DragNDrop.css';
import { MdLogout } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";




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
        <>
            <Navbar bg="light" expand="lg" className='bars'  >
                <Navbar.Brand href="#home">Image Upload  </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home"></Nav.Link>
                        <Nav.Link href="#image-upload"></Nav.Link>
                    </Nav>
                    <Nav>

                  
                        <NavDropdown title="Lindokuhle Mahlangu" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">lindo@gmail.com</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Reset Password</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="d-flex">
                <div className="vertical-panel bg p-3">
                    <h1 className='loghead'> Logo </h1>
                    <div className="mt-5 contain">
                        <button className="btn btn-primary navbarBTN btn-block mb-3">
                            <IoHomeOutline className="icon ma" /> Home
                        </button>
                        <button className="btn uplodBTN btn-block mb-5">
                            <IoCameraOutline className="icon ma  " /> Image Upload
                        </button>
                    </div>
                    <button className="btn logout btn-block mt-auto" onClick={handleLogout}>
                        
                    <MdLogout className="icon ma  " />
                        
                        Log Out</button>
                </div>
                <div className="container my-2 open">
                   
                    <div className="card border-0" >
                        <div className="card-body">

                        <h1 className="text-center mb-4 UploadHead">Image Upload</h1>



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
                            <div {...getRootProps({ className: "  dropNDrag" })}>
                                <input {...getInputProps()} />
                                <img className="mb-3" src={addFileIcon} alt="add file" style={{ height: '30%', width: '30%' }} />
                                <p>Drag and Drop Files</p>
                                <p>or </p>
                                <button type="button" className="btn pad btn-primary">Upload</button>
                            </div>
                            <div className="flex justify-center flex-wrap "> 
        {
            files.map((file)=>(
                <div className="image-preview m-2 p-4 w-40 h-40 " key={file.name}>
                    <img src={file.preview} alt="thumnail"
                    className='w-auto h-full rounded-md'
                    onLoad={
                        ()=>{
                            URL.revokeObjectURL(file.preview)
                        }
                    }
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
        </>
    );
}

export default DragNDrop;
