import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ImageView.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

function ImageView() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                const data = await response.json();
                setImage(data);
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        };

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
        }

        fetchImage();
    }, [imageId]);

    if (!image) {
        return <div>Loading...</div>;
    }

    return (
        <div className="content">
            <div className="sidebarHome">
                <header className='homelog'>Logo</header>
                <nav className="navButoom">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>
                            <button className="nav-buttonHome active">
                                <IoHomeOutline className="icon hm" />
                                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome" onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon hm" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome myLb" onClick={() => window.location.href = '/MyGallery'}>
                                <GrGallery className="icon hm" /> My Library
                            </button>
                        </li>
                    </ul>
                </nav>
                <button className='logout' onClick={() => window.location.href = '/logout'}>
                    <MdLogout className="icon hm" /> Logout
                </button>
            </div>

            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home"> Home <span>&#62;</span> Image View </Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? (
                            <NavDropdown title={<span><img src="assets\notebook-natural-laptop-macbook.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar>
                <div className="image-view">
                    <div className="image-container">
                        <img src={image.imageURL} alt={image.title || 'Image'} />
                        <div className="overlay">
                            <h2>{image.title || 'Untitled'}</h2>
                            <p>{image.description || 'No description available.'}</p>
                            <p><strong>Category:</strong> {image.category || 'Uncategorized'}</p>
                        </div>
                        <Link to="/home" className="close-button">X</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageView;
