import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import cloud_upload from './image/cloud_upload.svg';
import Error from './Error';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import './DragNDrop.css';
import { MdLogout } from "react-icons/md";

function DragNDrop() {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [validationMessages, setValidationMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.userName);
            setUserEmail(user.userEmail);
        }
    }, []);

    const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
        maxFiles: 2,
        accept: {
            "image/png": [".png", ".jpg", '.jpeg']
        },
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles);
        }
    });

    const handleLogout = () => {
        alert('Logged out');
    };

    const handleUpload = async () => {
        let messages = [];
        if (!title) messages.push('Image title is required.');
        if (!description) messages.push('Image description is required.');
        if (!category) messages.push('Category is required.');
        if (files.length === 0) messages.push('Image file is required.');

        if (messages.length > 0) {
            setValidationMessages(messages);
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setUploadMessage('User not logged in');
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
            const response = await fetch('/api/ImageUpload/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setUploadMessage('Pic was posted successfully.');
                setTitle('');
                setDescription('');
                setCategory('');
                setFiles([]);
                setValidationMessages([]);
            } else {
                setUploadMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setUploadMessage('Error uploading image.');
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
                        <NavDropdown title={userName} id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">{userEmail}</NavDropdown.Item>
                            <NavDropdown.Item href="LoggedInResetPassword">Reset Password</NavDropdown.Item>
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
                                <img className="mb-3" src={cloud_upload} alt="add file" style={{ height: '45%', width: '35%' }} />
                                <p>Drag and Drop Files</p>
                                <p>or </p>
                                <button type="button" className="btn pad btn-primary">Upload</button>
                            </div>
                            <div className="mt-3">
                                {acceptedFiles.length > 0 && <p className="text-success">🙂 Files accepted </p>}
                                {fileRejections.length > 0 && <Error errorM={fileRejections[0].errors[0]} />}
                            </div>
                            <div className="text-center mt-4">
                                <button type="button" className="btn btn-success" onClick={handleUpload}>Save</button>
                            </div>
                            {validationMessages.length > 0 && (
                                <div className="mt-3">
                                    {validationMessages.map((msg, index) => (
                                        <p key={index} className="text-danger">{msg}</p>
                                    ))}
                                </div>
                            )}
                            {uploadMessage && <div className="text-center mt-3"><p>{uploadMessage}</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DragNDrop;
