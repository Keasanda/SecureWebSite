import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import axios from 'axios';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { GrGallery } from "react-icons/gr";
import { MdLogout } from "react-icons/md";
import './EditImage.css';

function EditImage() {
    const { imageId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState({ imageId: '', title: '', description: '', category: '', userId: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error fetching image: ${errorData.message || response.statusText}`);
                }
                const data = await response.json();
                setImage(data);
            } catch (error) {
                console.error('Fetch image error:', error);
                setError(`Error fetching image: ${error.message}`);
            }
        };

        fetchImage();
    }, [imageId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setImage((prevImage) => ({ ...prevImage, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/ImageUpload/update-image/${imageId}`, image, {
                headers: { "Content-Type": "application/json" }
            });

            if (response.status === 200) {
                navigate("/MyGallery");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error deleting image: ${errorData.message || response.statusText}`);
            }

            navigate('/MyGallery');
        } catch (error) {
            console.error('Delete image error:', error);
            setError(`Error deleting image: ${error.message}`);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="content">
            <div className="sidebar">
                <header className='edit-log'>Logo</header>
                <nav className="navButoom">
                    <ul>
                        <li>
                            <button className="nav-button active">
                                <IoHomeOutline className="icon ma" /> Home
                            </button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon ma" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/MyGallery'}>
                                <GrGallery className="icon ma" /> My Library
                            </button>
                        </li>
                    </ul>
                </nav>
                <button className='logout' onClick={() => window.location.href = '/logout'}>
                    <MdLogout className="icon ma" /> Logout
                </button>
            </div>

            <div className="main-content">
                <Navbar bg="light" expand="lg" className='edit-nav'>
                    <Navbar.Brand style={{ marginLeft: '25px' }} href="#edit">Edit Image</Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {/* Profile dropdown can be added here */}
                    </Nav>
                </Navbar>
                <Card className="edit-card">
                    <Card.Body>
                        <Card.Title>Edit Image Details</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="title">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={image.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    value={image.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="category">
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="category"
                                    value={image.category}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="mt-3">
                                Update Image
                            </Button>
                            <Button variant="danger" onClick={handleDelete} className="mt-3 ml-3">
                                Delete Image
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}

export default EditImage;
