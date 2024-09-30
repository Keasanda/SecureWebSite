import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { GrGallery } from "react-icons/gr";
import { MdLogout } from "react-icons/md";
import './EditImage.css';

function EditImage() {
    // Extracting imageId from URL params
    const { imageId } = useParams();
    // To programmatically navigate to other routes
    const navigate = useNavigate();
    // State to store image details
    const [image, setImage] = useState({ imageId: '', title: '', description: '', category: '', userId: '' });
    // State to store any errors during API calls
    const [error, setError] = useState(null);
    // State to store success messages upon successful actions
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch the image details on component mount
    useEffect(() => {
        const fetchImage = async () => {
            try {
                // Fetching image details by imageId from the API
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error fetching image: ${errorData.message || response.statusText}`);
                }
                // Setting the fetched image data in the state
                const data = await response.json();
                setImage(data);
            } catch (error) {
                // Handling errors in fetching
                console.error('Fetch image error:', error);
                setError(`Error fetching image: ${error.message}`);
            }
        };

        fetchImage();
    }, [imageId]); // Dependency array ensures this runs when imageId changes

    // Handle changes to form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update image details in the state
        setImage((prevImage) => ({ ...prevImage, [name]: value }));
    };

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            // Logging out the user by calling the backend API
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            if (response.ok) {
                // Clearing local storage and redirecting to login page
                localStorage.removeItem("user");
                window.location.href = data.redirectTo || "/login";
            } else {
                console.log("Could not logout: ", response);
            }
        } catch (error) {
            // Handling logout errors
            console.error('Error logging out:', error);
        }
    };

    // Handle form submission to update image details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sending a PUT request to update image details
            const response = await axios.put(`/api/ImageUpload/update-image/${imageId}`, image, {
                headers: { "Content-Type": "application/json" }
            });

            if (response.status === 200) {
                // Set the success message after successful update
                setSuccessMessage(response.data.message);
                // Optionally, you can redirect the user after a successful update
            }
        } catch (error) {
            // Handling update errors
            console.error(error);
        }
    };

    // Handle image deletion
    const handleDelete = async () => {
        try {
            // Sending DELETE request to remove the image
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error deleting image: ${errorData.message || response.statusText}`);
            }
            // Redirecting to MyGallery after successful deletion
            navigate('/MyGallery');
        } catch (error) {
            // Handling deletion errors
            console.error('Delete image error:', error);
            setError(`Error deleting image: ${error.message}`);
        }
    };

    // If there's an error, display it
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="content">
            {/* Sidebar with navigation buttons */}
            <div className="vertical-panel bg p-3">
                <h1>
                    <img src="https://i.imgur.com/aNOZKGU.png" alt="Profile" className="logopic"></img>
                </h1>
                <div className="mt-5 contain">
                    <button className="btn btn-primary navbarh ho btn-block mb-3" onClick={() => window.location.href = '/Home'}>
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                    <button className="btn homebtn btn-block mb-5" onClick={() => window.location.href = '/dragndrop'}>
                        <IoCameraOutline className="icon ma" /> Image Upload
                    </button>
                    <button className="btn navbarBTN ho btn-block mb-5" onClick={() => window.location.href = '/MyGallery'}>
                        <GrGallery className="icon ma" /> My Gallery
                    </button>
                </div>
                <button className="btn logout mt-auto" onClick={handleLogout}>
                    <MdLogout className="icon ma" /> Log Out
                </button>
            </div>

            {/* Main content area for editing the image */}
            <div className="main-content">
                {/* Navbar for the edit page */}
                <Navbar bg="light" expand="lg" className='edit-nav'>
                    <Navbar.Brand style={{ marginLeft: '25px' }} href="#edit">Edit Image</Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                </Navbar>

                {/* Card containing the image editing form */}
                <Card className="edit-card">
                    <Card.Body>
                        <Card.Title>Edit Image Details</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            {/* Form field for image title */}
                            <Form.Group controlId="title">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={image.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            {/* Form field for image description */}
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    value={image.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            {/* Form field for image category */}
                            <Form.Group controlId="category">
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="category"
                                    value={image.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Animals">Animals</option>
                                    <option value="Food">Food</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Vehicle">Vehicle</option>
                                </Form.Control>
                            </Form.Group>
                            {/* Update and Delete buttons */}
                            <Button variant="primary" type="submit" className="mt-3 update ">
                                Update Image
                            </Button>
                            <Button variant="danger" onClick={handleDelete} className="mt-3 deleteBTN">
                                Delete Image
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Display success message if image is updated */}
                {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
            </div>
        </div>
    );
}

export default EditImage;
