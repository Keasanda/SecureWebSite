import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import cloud_upload from './image/cloud_upload.svg';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import './DragNDrop.css';
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

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

    const { getRootProps, getInputProps, open, acceptedFiles, fileRejections } = useDropzone({
        maxFiles: 2,
        accept: {
            "image/png": [".png", ".jpg", '.jpeg']
        },
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles);
        },
        noClick: true,
        noKeyboard: true
    });

    useEffect(() => {
        const messages = fileRejections.map(rejection => 
            `${rejection.file.name} is not a supported format.`
        );
        setValidationMessages(messages);
    }, [fileRejections]);

 


    const handleLogout = async () => {
        try {
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include"
            });
    
            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user");
                window.location.href = data.redirectTo || "/login";
            } else {
                console.log("Could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
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
           
            <div className="d-flex">

          


          


                <div className="vertical-panelh bg p-3">
                    <h1 >  < img src="src\assets\Image Gallery.png" alt="Profile" className=" logopic" ></img>     </h1>
                    <div className="mt-5 contain">
                        <button       className="btn btn-primary navbarh ho btn-block mb-3"             onClick={() => window.location.href = '/Home'}>  
                     
                            <IoHomeOutline className="icon ma" /> Home
                        </button>
                        <button className="btn uplodBTN ho btn-block mb-5">
                            <IoCameraOutline className="icon ma  " /> Image Upload
                        </button>

                        <button   className="btn navbarBTN ho btn-block mb-5"
                     onClick={() => window.location.href = '/MyGallery'}>  
                       
                            <GrGallery  className="icon ma  " /> My Gallery
                        </button>


                    </div>
                    <button className="btn logout  mt-auto" onClick={handleLogout}>
                        <MdLogout className="icon ma  " />
                        Log Out
                    </button>
                </div>


                


                <div className="Uploadmuster">








                <Navbar bg="light" expand="lg" className='bars'>
                <Navbar.Brand style={{ marginLeft: '25px', fontFamily:'Poppins', fontSize:"normal" }} href="#home"> Image Upload <span>&#62;</span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home"></Nav.Link>
                        <Nav.Link href="#image-upload"></Nav.Link>
                    </Nav>
                    <Nav>
                        <NavDropdown title={userName} id="basic-nav-dropdown ">
                            <NavDropdown.Item href="#action/3.1">{userEmail}</NavDropdown.Item>
                            <NavDropdown.Item href="LoggedInResetPassword">Reset Password</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            
              




                    <div className="card border-0">
                        <div className="">
                            <h1 className="text-center mb-4 UploadHead">Image Upload</h1>
                            <div className="mb-4">
                                <label htmlFor="title" className=" Imagetitle">Image Title</label>
                                <input
                                    type="text"
                                    className="form-control imgtil"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="category" className=" ImageCategory"> Image Category</label>
                                <select
                                    className="form-control imgtil"
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option value="category1">Nature</option>
                                    <option value="category2">Animals</option>
                                    <option value="category3">Food</option>
                                    <option value="category4">Feshion</option>
                                     <option value="category5">Vehicle</option>
                                </select>
                            </div>
                            <div className="mb-3 botto">
                                <label htmlFor="description" className=" ImageDiscription">Image Description</label>
                                <textarea
                                    className="form-control discription"
                                    id="description"
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="upload-container mt-4">
                                <div {...getRootProps()} className="drag-drop-zone">
                                    <input {...getInputProps()} />
                                    <img src={cloud_upload} alt="upload" className="cloud" />
                                    <p className="drag-drop-text">Drag and Drop Files</p>

                                    <p> or </p>


                                    <button className="btn btn-primary upload-btn" type="button" onClick={open}>Upload</button>

                                  
                                  
                                </div>
                            </div>
                            <button className="btn btn-primary save mt-4 mb-3" type="button" onClick={handleUpload}>Save</button>
                            {uploadMessage && <p className="mt-3 text-center">{uploadMessage}</p>}
                            {validationMessages.length > 0 && (
                                <div className="alert alert-danger mt-4" role="alert">
                                    {validationMessages.map((message, index) => (
                                        <p key={index}>{message}</p>



                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>




        </>
    );
}

export default DragNDrop;