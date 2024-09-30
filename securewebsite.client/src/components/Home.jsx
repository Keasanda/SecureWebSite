import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { IoIosSearch } from "react-icons/io";
import { FaComment, FaHeart } from "react-icons/fa";

function Home() {
    document.title = "Welcome";

    // State variables to manage user info, images, comment and love counts, etc.
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
    const [loveCounts, setLoveCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 6; // Number of images to display per page

    // Load user info from local storage and fetch images when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
        }
        fetchImages();
    }, []);

    // Fetch images from the backend
    const fetchImages = async () => {
        try {
            const response = await fetch('api/ImageUpload/images');
            const data = await response.json();
            setImages(data);
            setFilteredImages(data);
            fetchCommentCounts(data);  // Fetch comment counts for the images
            fetchLoveCounts(data);     // Fetch love counts for the images
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    // Fetch comment counts for the images
    const fetchCommentCounts = async (images) => {
        try {
            const imageIds = images.map(image => image.imageId);
            const response = await fetch('api/Comments/comment-counts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imageIds),
            });
            const counts = await response.json();
            setCommentCounts(counts);
        } catch (error) {
            console.error('Error fetching comment counts:', error);
        }
    };

    // Fetch love counts for the images
    const fetchLoveCounts = async (images) => {
        try {
            const imageIds = images.map(image => image.imageId);
            const response = await fetch('api/Likes/love-counts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imageIds),
            });
            const counts = await response.json();
            setLoveCounts(counts);
        } catch (error) {
            console.error('Error fetching love counts:', error);
        }
    };

    // Toggle love (like/unlike) for an image
    const toggleLove = async (imageId) => {
        const userId = userInfo?.userID;
        if (!userId) return;

        try {
            const response = await fetch(`api/Likes/${imageId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userId),
            });
            if (response.ok) {
                fetchLoveCounts(images);  // Refresh love counts after toggling
            }
        } catch (error) {
            console.error('Error toggling love:', error);
        }
    };

    // Log the user out and redirect to login page
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
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Handle search input to filter images based on title or category
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

    // Pagination logic to manage displayed images per page
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    const [pageRange, setPageRange] = useState({ start: 1, end: Math.min(3, totalPages) });

    const handleNextSet = () => {
        const newStart = pageRange.end + 1;
        const newEnd = Math.min(newStart + 2, totalPages);
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart);
    };

    const handlePrevSet = () => {
        const newStart = Math.max(pageRange.start - 3, 1);
        const newEnd = newStart + 2;
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart);
    };

    // Set current page for pagination
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        if (pageNumber > pageRange.end) {
            handleNextSet();
        } else if (pageNumber < pageRange.start) {
            handlePrevSet();
        }
    };

    return (
        <div className="content">
            {/* Sidebar panel */}
            <div className="vertical-panel bg p-3">
                <h1><img src="src/assets/Image Gallery.png" alt="Profile" className="logopic" /></h1>
                <div className="mt-5 contain">
                    <button className="btn btn-primary navbarh ho btn-block mb-3" onClick={() => window.location.href = '/Home'}>
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                    <button className="btn homebtn ho btn-block mb-5" onClick={() => window.location.href = '/dragndrop'}>
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

            {/* Main content */}
            <div className="main-content">
                {/* Navbar */}
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home"> Home <span>&#62;</span> </Navbar.Brand>
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

                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button className="filters-button"><IoFilterSharp className="icon" /> Search</button>
                </div>

                {/* Image gallery */}
                <div className="image-gallery">
                    {userInfo ? (
                        currentImages.length > 0 ? (
                            currentImages.map((image) => (
                                <div key={image.imageId} className="home-card">
                                    <Link to={`/image/${image.imageId}`} className="home-image-link">
                                        <div className="home-image-container">
                                            <img src={image.imageURL} className="home-image-item" alt={image.title} />
                                            <div className="card-title-overlay">
                                                <h5>{image.title}</h5>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="card-actions">
                                        <div className="icon-group" onClick={() => toggleLove(image.imageId)}>
                                            <FaHeart className="heart-icon" />
                                            <span className="icon-count">{loveCounts[image.imageId] || 0}</span>
                                        </div>
                                        <Link to={`/image/${image.imageId}`} className="icon-group">
                                            <FaComment className="comment-icon" />
                                            <span className="icon-count">{commentCounts[image.imageId] || 0}</span>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>No images found</div>
                        )
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <ul className="pagination-list">
                        {pageRange.start > 1 && (
                            <li className="pagination-item" onClick={handlePrevSet}>&laquo;</li>
                        )}
                        {Array.from({ length: pageRange.end - pageRange.start + 1 }, (_, i) => i + pageRange.start).map((number) => (
                            <li key={number} className={`pagination-item ${number === currentPage ? 'active' : ''}`} onClick={() => paginate(number)}>
                                {number}
                            </li>
                        ))}
                        {pageRange.end < totalPages && (
                            <li className="pagination-item" onClick={handleNextSet}>&raquo;</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Home;
