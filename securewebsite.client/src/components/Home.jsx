import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { FaComment, FaHeart, FaThumbsUp } from "react-icons/fa"; // Import the required icons

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
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
            setFilteredImages(data); // Initialize filteredImages with all images
            fetchCommentCounts(data); // Fetch comment counts after images are loaded
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
            <div className="sidebarHome">
                <header className='homelog'>Logo</header>
                <nav className="navButoom">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>
                            <button className="nav-buttonHome ho active">
                                <IoHomeOutline className="icon hm" /> Home
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome ho" onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon hm" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome myLb ho" onClick={() => window.location.href = '/MyGallery'}>
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
                                    <div className="card-actions">
                                        <div className="icon-group">
                                            <FaThumbsUp className="like-icon" />
                                            <span className="icon-count">0</span>
                                        </div>
                                        <div className="icon-group">
                                            <FaHeart className="heart-icon" />
                                            <span className="icon-count">0</span>
                                        </div>
                                        <div className="icon-group">
                                            <FaComment className="comment-icon" />
                                            <span className="icon-count">{commentCounts[image.imageId] || 0}</span>
                                        </div>
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

export default Home;
