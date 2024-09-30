import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import cloud_upload from './image/cloud_upload.svg'; // Importing the upload icon
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5"; // Icons for home and camera
import './DragNDrop.css'; // Custom styles for the component
import { MdLogout } from "react-icons/md"; // Logout icon
import { GrGallery } from "react-icons/gr"; // Gallery icon

function DragNDrop() {
    // States to manage form inputs and file uploads
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [validationMessages, setValidationMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Fetch user information from localStorage on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.userName);
            setUserEmail(user.userEmail);
        }
    }, []);

    // Set up the file dropzone configuration
    const { getRootProps, getInputProps, open, acceptedFiles, fileRejections } = useDropzone({
        maxFiles: 2, // Limit the number of files
        accept: {
            "image/png": [".png", ".jpg", '.jpeg'] // Accept only image file formats
        },
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles); // Update state with accepted files
        },
        noClick: true, // Disable default click behavior
        noKeyboard: true // Disable default keyboard behavior
    });

    // Handle file rejections and display validation messages
    useEffect(() => {
        const messages = fileRejections.map(rejection =>
            `${rejection.file.name} is not a supported format.`
        );
        setValidationMessages(messages);
    }, [fileRejections]);

    // Logout function that calls the API and clears user data from localStorage
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user"); // Clear user data from local storage
                window.location.href = data.redirectTo || "/login"; // Redirect to login
            } else {
                console.log("Could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Handle image upload functionality
    const handleUpload = async () => {
        let messages = [];
        // Basic form validation
        if (!title) messages.push('Image title is required.');
        if (!description) messages.push('Image description is required.');
        if (!category) messages.push('Category is required.');
        if (files.length === 0) messages.push('Image file is required.');

        if (messages.length > 0) {
            setValidationMessages(messages); // Display validation messages
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setUploadMessage('User not logged in');
            return;
        }

        const user = JSON.parse(storedUser);
        const userId = user.userID;

        // Prepare form data for the API request
        const formData = new FormData();
        formData.append('file', files[0]); // Append the first file
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('userId', userId);

        // API call to upload the image
        try {
            const response = await fetch('/api/ImageUpload/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                // Reset form and display success message
                setUploadMessage('Pic was posted successfully.');
                setTitle('');
                setDescription('');
                setCategory('');
                setFiles([]);
                setValidationMessages([]);
            } else {
                // Display error message
                setUploadMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setUploadMessage('Error uploading image.'); // Handle upload error
        }
    };

    return (
        <>
            <div className="d-flex">
                {/* Sidebar with navigation buttons */}
                <div className="vertical-panelh bg p-3">
                    <h1>
                        <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic" />
                    </h1>
                    <div className="mt-5 contain">
                        <button className="btn btn-primary navbarh2 ho btn-block mb-3" onClick={() => window.location.href = '/Home'}>
                            <IoHomeOutline className="icon ma" /> Home
                        </button>
                        <button className="btn uplodBTN ho btn-block mb-5">
                            <IoCameraOutline className="icon ma" /> Image Upload
                        </button>
                        <button className="btn navbarBTN2 ho btn-block mb-5" onClick={() => window.location.href = '/MyGallery'}>
                            <GrGallery className="icon ma" /> My Gallery
                        </button>
                    </div>
                    <button className="btn logout mt-auto" onClick={handleLogout}>
                        <MdLogout className="icon ma" /> Log Out
                    </button>
                </div>

                {/* Main content for image upload */}
                <div className="Uploadmuster">
                    <Navbar bg="light" expand="lg" className='bars'>
                        <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home">
                            Image Upload <span>&#62;</span>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto"></Nav>
                            <Nav>
                                {/* Dropdown for user details */}
                                <NavDropdown title={userName} id="basic-nav-dropdown ">
                                    <NavDropdown.Item>{userEmail}</NavDropdown.Item>
                                    <NavDropdown.Item href="LoggedInResetPassword">Reset Password</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>

                    {/* Image upload form */}
                    <div className="card border-0">
                        <div className="">
                            <h1 className="text-center mb-4 UploadHead">Image Upload</h1>
                            <div className="mb-4">
                                <label htmlFor="title" className="Imagetitle">Image Title</label>
                                <input
                                    type="text"
                                    className="form-control imgtil"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="category" className="ImageCategory">Image Category</label>
                                <select
                                    className="form-control imgtil"
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Animals">Animals</option>
                                    <option value="Food">Food</option>
                                    <option value="Feshion">Feshion</option>
                                    <option value="Vehicle">Vehicle</option>
                                </select>
                            </div>
                            <div className="mb-3 botto">
                                <label htmlFor="description" className="ImageDiscription">Image Description</label>
                                <textarea
                                    className="form-control discription"
                                    id="description"
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="upload-container mt-4">
                                {/* Drag-and-drop area for file upload */}
                                <div {...getRootProps()} className="drag-drop-zone">
                                    <input {...getInputProps()} />
                                    <img src={cloud_upload} alt="upload" className="cloud" />
                                    <p className="drag-drop-text">Drag and Drop Files</p>
                                    <p className='orn'> or </p>
                                    <button className="btn btn-primary upload-btn" type="button" onClick={open}>Upload</button>
                                </div>
                            </div>
                            <button className="btn btn-primary save mt-4 mb-3" type="button" onClick={handleUpload}>Save</button>
                            {uploadMessage && <p className="mt-3 greentext">{uploadMessage}</p>}
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
