import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import taste from './MyGallery.module.css';
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { FaComment } from "react-icons/fa"; // Import the comment icon

function MyGallery() {
    document.title = "My Gallery";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 6; // Adjusted for three per row

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
            fetchUserImages(user.userID);
        }
    }, []);

    const fetchUserImages = async (userID) => {
        if (!userID) {
            console.error('User ID is not defined');
            return;
        }
        try {
            const response = await fetch(`/api/ImageUpload/images-with-comments`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // Filter images based on userId
            const userImages = data.filter(image => image.image.userId === userID);
            setImages(userImages);
            setFilteredImages(userImages);
        } catch (error) {
            console.error('Error fetching images:', error);
            setImages([]);
            setFilteredImages([]);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === '') {
            setFilteredImages(images);
        } else {
            const filtered = images.filter(image =>
                image.image.title.toLowerCase().includes(query) ||
                image.image.category.toLowerCase().includes(query)
            );
            setFilteredImages(filtered);
        }
    };

    const handleDelete = async (imageId) => {
        try {
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Remove the deleted image from the state
                setImages(images.filter(image => image.image.imageId !== imageId));
                setFilteredImages(filteredImages.filter(image => image.image.imageId !== imageId));
            } else {
                console.error('Error deleting image:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user");
                alert(data.message);
                window.location.href = "/login";
            } else {
                console.log("could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className={taste.content}>
    <div className={taste.sidebarrHome}>
        <img src="src/assets/Image Gallery.png"className={taste.logo} />
        <nav className={taste.navButoom}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>
                        <button className={taste.homelog} onClick={() => window.location.href = '/home'}>
                                <IoHomeOutline className="icon ma" /> Home
                            </button>
                        </li>
                        <li>
                            <button className={taste.homelog} onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon ma" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className={taste.homelog} onClick={() => window.location.href = '/MyGallery'}>
                                <GrGallery className="icon ma" /> My Gallery
                            </button>
                        </li>
                    </ul>
                </nav>
                <button className={taste.logout} onClick={handleLogout}>
            <MdLogout className={taste.icon} /> Logout
        </button>
            </div>
            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily:'Poppins', fontSize:"normal" }} href="#home"> My Gallery <span>&#62;</span></Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? (
                            <NavDropdown title={<span><img src="src/assets/notebook-natural-laptop-macbook.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button className="filters-button"><IoFilterSharp className="icon" /> Filters</button>
                </div>
                <div className="image-gallery">
                    {userInfo ? (
                        currentImages.length > 0 ? (
                            currentImages.map(({ image, commentCount }) => (
                                <Link to={`/image/${image.imageId}`} key={image.imageId} className="card">
                                    <div className="image-container">
                                        <img src={image.imageURL} className="card-img-top" alt={image.title} />
                                    </div>
                                    <div className="card-title-overlay">
                                        <h5>{image.title}</h5>
                                        <p className="dicrip">{image.description}</p>
                                    </div>
                                    <div className="card-body">
                                  
                                        <Link to={`/edit-image/${image.imageId}`} className="btn btn-secondary">Edit</Link>
                                        <button onClick={() => handleDelete(image.imageId)} className="btn btn-danger">Delete</button>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-matches-message">No images match your search criteria.</p>
                        )
                    ) : (
                        <p className="no-matches-message">Please log in to view images.</p>
                    )}
                </div>
                <div className="pagination">
                    {Array.from({ length: Math.ceil(filteredImages.length / imagesPerPage) }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`page-link ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => paginate(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
         );
        } 

export default MyGallery;
