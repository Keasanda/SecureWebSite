import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css'; // Reuse the same CSS for consistency
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

function MyGallery() {
    document.title = "My Gallery";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 6;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
            fetchUserImages(user.userID); // Use userID here
        }
    }, []);

    const fetchUserImages = async (userID) => { // Use userID here
        if (!userID) {
            console.error('User ID is not defined');
            return;
        }
        try {
            const response = await fetch(`/api/ImageUpload/user-images/${userID}`);
            const data = await response.json();
            setImages(data);
            setFilteredImages(data); // Initialize filteredImages with all images
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === '') {
            setFilteredImages(images);
        } else {
            const filtered = images.filter(image =>
                image.title.toLowerCase().includes(query) ||
                image.category.toLowerCase().includes(query)
            );
            setFilteredImages(filtered);
        }
    };

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="content">
            <div className="sidebar">
                <header className='homelog'>Logo</header>
                <nav className="navButoom">
                    <ul>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/home'}>
                                <IoHomeOutline className="icon ma" /> Home
                            </button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon ma" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className="nav-button active">
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
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px' }} href="#home">My Gallery</Navbar.Brand>
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
                            currentImages.map((image) => (
                                <Link to={`/image/${image.imageId}`} key={image.imageId} className="card">
                                    <div className="image-container">
                                        <img src={image.imageURL} className="card-img-top" alt={image.title} />
                                    </div>
                                    <div className="card-title-overlay">
                                        <h5>{image.title}</h5>
                                        <p>{image.description}</p>
                                    </div>
                                    <div className="card-body">
                                  
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-matches-message">No images match your search criteria.</p>
                        )
                    ) : (
                        <div className='warning'>
                            <p>Please login to view your images.</p>
                        </div>
                    )}
                </div>
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        {Array.from({ length: Math.ceil(filteredImages.length / imagesPerPage) }, (_, i) => (
                            <li className={`page-item ${currentPage === i + 1 ? 'active' : ''}`} key={i + 1}>
                                <a className="page-link" href="#" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default MyGallery;
