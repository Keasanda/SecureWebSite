import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import addFileIcon from './image/addFileIcon.svg';
import Error from './Error';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import './DragNDrop.css';
import { MdLogout } from "react-icons/md";
import axios from 'axios';

function DragNDrop() {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [uploadedFilePath, setUploadedFilePath] = useState('');
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
        alert('Logged out');
    };

    const handleUpload = async () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert('User not logged in');
            return;
        }

        const user = JSON.parse(storedUser);
        const userId = user.userID;

        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('userId', userId);

        try {
            const response = await axios.post('/api/ImageUpload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadedFilePath(response.data.filePath); // Save the file path for later
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleSave = async () => {
        if (!uploadedFilePath) {
            alert('No file uploaded');
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert('User not logged in');
            return;
        }

        const user = JSON.parse(storedUser);
        const userId = user.userID;

        const imageDetails = {
            title,
            description,
            category,
            imageURL: uploadedFilePath,
            userId
        };

        try {
            const response = await axios.post('/api/ImageUpload/save', imageDetails);
            console.log(response.data);
            // Optionally clear the form or show a success message here
        } catch (error) {
            console.error('Error saving image details:', error);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg" className='bars'>
                <Navbar.Brand href="#home">Image Upload</Navbar.Brand>
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
                        Log Out
                    </button>
                </div>
                <div className="container my-2 open">
                    <div className="card border-0">
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
                            <div className="mb-4">
                                <label htmlFor="category" className="form-label Imagetitle">Category</label>
                                <select
                                    className="form-control imgtil"
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option value="category1">Category 1</option>
                                    <option value="category2">Category 2</option>
                                    <option value="category3">Category 3</option>
                                </select>
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
                            <div {...getRootProps({ className: "dropNDrag" })}>
                                <input {...getInputProps()} />
                                <img className="mb-3" src={addFileIcon} alt="add file" style={{ height: '30%', width: '30%' }} />
                                <p>Drag and Drop Files</p>
                                <p>or </p>
                                <button type="button" className="btn pad btn-primary" onClick={handleUpload}>Upload</button>
                            </div>
                            <div className="flex justify-center flex-wrap">
                                {
                                    files.map((file) => (
                                        <div className="image-preview m-2 p-4 w-40 h-40 " key={file.name}>
                                            <img src={file.preview} alt="thumbnail"
                                                className='w-auto h-full rounded-md'
                                                onLoad={() => {
                                                    URL.revokeObjectURL(file.preview)
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="mt-3">
                                {acceptedFiles[0] ? <p className="text-success">🙂 Files accepted </p> : ''}
                            </div>
                            <div className="mt-3">
                                {fileRejections[0] ? <Error errorM={fileRejections[0].errors[0]} /> : ''}
                            </div>
                            <button type="button" className="btn btn-primary mt-3" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DragNDrop;
