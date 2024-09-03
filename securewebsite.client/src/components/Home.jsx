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
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
    const [loveCounts, setLoveCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 6; // Adjusted for three per row

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
        }

        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('api/ImageUpload/images');
            const data = await response.json();
            setImages(data);
            setFilteredImages(data);
            fetchCommentCounts(data);
            fetchLoveCounts(data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const fetchCommentCounts = async (images) => {
        try {
            const imageIds = images.map(image => image.imageId);
            const response = await fetch('api/Comments/comment-counts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageIds),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch comment counts');
            }
            const counts = await response.json();
            setCommentCounts(counts);
        } catch (error) {
            console.error('Error fetching comment counts:', error);
        }
    };

    const fetchLoveCounts = async (images) => {
        try {
            const imageIds = images.map(image => image.imageId);
            const response = await fetch('api/Likes/love-counts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageIds),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch love counts');
            }

            const counts = await response.json();
            setLoveCounts(counts);
        } catch (error) {
            console.error('Error fetching love counts:', error);
        }
    };

    const toggleLove = async (imageId) => {
        const userId = userInfo?.userID;
        if (!userId) return;

        try {
            const response = await fetch(`api/Likes/${imageId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userId),
            });
            if (response.ok) {
                fetchLoveCounts(images);
            }
        } catch (error) {
            console.error('Error toggling love:', error);
        }
    };


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

    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    const [pageRange, setPageRange] = useState({ start: 1, end: Math.min(3, totalPages) });

    const handleNextSet = () => {
        const newStart = pageRange.end + 1;
        const newEnd = Math.min(newStart + 2, totalPages);
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart); // Set current page to the start of the new range
    };

    const handlePrevSet = () => {
        const newStart = Math.max(pageRange.start - 3, 1);
        const newEnd = newStart + 2;
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart); // Set current page to the start of the new range
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);

        // Adjust the page range dynamically based on the selected page
        if (pageNumber > pageRange.end) {
            handleNextSet();
        } else if (pageNumber < pageRange.start) {
            handlePrevSet();
        }
    };

    return (
        <div className="content">
            <div className="vertical-panel bg p-3">
                <h1><img src="src\assets\Image Gallery.png" alt="Profile" className="logopic" /></h1>
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

            <div className="main-content">
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
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button className="filters-button"><IoFilterSharp className="icon" /> Search</button>
                </div>

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
                                        <div className="icon-group commpush">
                                            <FaComment className="comment-icon" />
                                            <span className="icon-count">{commentCounts[image.imageId] || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No images found.</p>
                        )
                    ) : (
                        <p>Please log in to view the images.</p>
                    )}
                </div>

                <div className="pagination">
                    {pageRange.start > 1 && (
                        <button className="page-link" onClick={handlePrevSet}>
                            &lt;
                        </button>
                    )}
                    {Array.from({ length: pageRange.end - pageRange.start + 1 }, (_, index) => (
                        <button
                            key={pageRange.start + index}
                            className={`page-link ${currentPage === pageRange.start + index ? 'active' : ''}`}
                            onClick={() => paginate(pageRange.start + index)}
                        >
                            {pageRange.start + index}
                        </button>
                    ))}
                    {pageRange.end < totalPages && (
                        <button className="page-link" onClick={handleNextSet}>
                            &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
