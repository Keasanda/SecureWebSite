import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Home.module.css';
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { FaComment, FaHeart } from "react-icons/fa"; // Import the required icons

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
    const [loveCounts, setLoveCounts] = useState({}); // New state for love counts
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 3; // Adjusted for three per row

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
            fetchLoveCounts(data); // Fetch love counts after images are loaded
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
            const imageIds = images.map(image => image.imageId); // Only extract image IDs
            
            const response = await fetch('api/Likes/love-counts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageIds),  // Send only image IDs
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch love counts');
            }
    
            const counts = await response.json();
            setLoveCounts(counts);  // Assuming the response is a dictionary of imageId to love count
        } catch (error) {
            console.error('Error fetching love counts:', error);
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
                alert(data.message);
                window.location.href = "/login";
            } else {
                console.log("could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
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
                // Fetch the updated love counts after toggling the love status
                fetchLoveCounts(images);
            }
        } catch (error) {
            console.error('Error toggling love:', error);
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
        <div className={styles.content}>
    <div className={styles.sidebarHome}>
        <img src="src/assets/Image Gallery.png"className={styles.logo} />
        <nav className={styles.navButoom}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>
                        <button className={styles.homelog} onClick={() => window.location.href = '/home'}>
                                <IoHomeOutline className="icon ma" /> Home
                            </button>
                        </li>
                        <li>
                            <button className={styles.homelog} onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon ma" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className={styles.homelog} onClick={() => window.location.href = '/'}>
                                <GrGallery className="icon ma" /> My Gallery
                            </button>
                        </li>
                    </ul>
                </nav>
                <button className={styles.logout} onClick={handleLogout}>
            <MdLogout className={styles.icon} /> Logout
        </button>
            </div>
            <div className={styles.mainContent}>
        <Navbar bg="light" expand="lg" className={styles.homenav}>
            <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home"> Home <span>&#62;</span> </Navbar.Brand>
            <Nav className="me-auto"></Nav>
            <Nav>
            {userInfo ? (
                    <NavDropdown title={<span><img src="src/assets/notebook-natural-laptop-macbook.jpg" alt="Profile" className={styles.profileImage} /> {userInfo.userName}</span>}>
                        <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                        <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                    </NavDropdown>
                ) : (
                    <Nav.Link href="/login">Login</Nav.Link>
                )}
            </Nav>
        </Navbar>
        <div className={styles.searchBar}>
            <input
                type="text"
                placeholder="Search for..."
                value={searchQuery}
                onChange={handleSearch}
                className={styles.searchInput}
            />
                    <button className={styles.filtersButton}><IoFilterSharp className={styles.icon} /> Filters</button>
        </div>
        <div className={styles.imageGallery}>
            {userInfo ? (
                currentImages.length > 0 ? (
                    currentImages.map((image) => (
                        <Link to={`/image/${image.imageId}`} key={image.imageId} className={styles.card}>
                            <div className={styles.imageContainer}>
                                <img src={image.imageURL} className="card-img-top" alt={image.title} />
                            </div>
                            <div className={styles.cardTitleOverlay}>
                                <h5>{image.title}</h5>
                                
                            </div>
                            <div className={styles.cardActions}>
                                <div className={styles.iconGroup} onClick={() => toggleLove(image.imageId)}>
                                    <FaHeart className={styles.heartIcon} />
                                    <span className={styles.iconCount}>{loveCounts[image.imageId] || 0}</span>
                                </div>
                                <div className={`${styles.iconGroup} ${styles.commpush}`}>
                                    <FaComment className={styles.commentIcon} />
                                    <span className={styles.iconCount}>{commentCounts[image.imageId] || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className={styles.noMatchesMessage}>No images match your search criteria.</p>
                )
            ) : (
                <p className={styles.noMatchesMessage}>Please log in to view images.</p>
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
