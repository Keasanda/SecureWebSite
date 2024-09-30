import React, { useEffect, useState } from 'react'; // Import React and hooks
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'; // Import Bootstrap components
import { Link } from 'react-router-dom'; // Import Link for routing
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './MyGallery.css'; // Import custom CSS for styling
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5"; // Import icons
import { MdLogout } from "react-icons/md"; // Import logout icon
import { GrGallery } from "react-icons/gr"; // Import gallery icon
import { FaComment } from "react-icons/fa"; // Import comment icon

function MyGallery() {
    // Set the document title for the page
    document.title = "My Gallery";

    // State variables for user info, images, filtered images, current page, search query, and validation messages
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const imagesPerPage = 6; // Number of images to display per page
    const [validationMessage, setValidationMessage] = useState(null);

    // Fetch user info and images on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
            fetchUserImages(user.userID); // Fetch images for the logged-in user
        }
    }, []);

    // Fetch images associated with the logged-in user
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
            setFilteredImages(userImages); // Set filtered images to user images
        } catch (error) {
            console.error('Error fetching images:', error);
            setImages([]);
            setFilteredImages([]);
        }
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user"); // Clear user data from local storage
                window.location.href = data.redirectTo || "/login"; // Redirect to login page
            } else {
                console.log("Could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Handle image search functionality
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter images based on search query
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

    // Handle image deletion
    const handleDelete = async (imageId) => {
        try {
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Remove the deleted image from the state
                setImages(images.filter(image => image.image.imageId !== imageId));
                setFilteredImages(filteredImages.filter(image => image.image.imageId !== imageId));

                // Set success validation message
                setValidationMessage("Image deleted successfully.");

                // Clear the message after 3 seconds
                setTimeout(() => {
                    setValidationMessage(null);
                }, 3000);
            } else {
                console.error('Error deleting image:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    // Pagination calculations
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    const [pageRange, setPageRange] = useState({ start: 1, end: Math.min(3, totalPages) });

    // Handle next set of pagination
    const handleNextSet = () => {
        const newStart = pageRange.end + 1;
        const newEnd = Math.min(newStart + 2, totalPages);
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart); // Set current page to the start of the new range
    };

    // Handle previous set of pagination
    const handlePrevSet = () => {
        const newStart = Math.max(pageRange.start - 3, 1);
        const newEnd = newStart + 2;
        setPageRange({ start: newStart, end: newEnd });
        setCurrentPage(newStart); // Set current page to the start of the new range
    };

    // Paginate to a specific page
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
            <div className="vertical-panel bg p-3"> {/* Vertical panel for navigation */}
                <h1>
                    <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic" /> {/* Logo image */}
                </h1>
                <div className="mt-5 contain">
                    <button className="btn btn-primary navbarh ho btn-block mb-3" onClick={() => window.location.href = '/Home'}>
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                    <button className="btn gallerybtn ho btn-block mb-5" onClick={() => window.location.href = '/dragndrop'}>
                        <IoCameraOutline className="icon ma" /> Image Upload
                    </button>
                    <button className="btn navbarBTN ho btn-block mb-5" onClick={() => window.location.href = '/MyGallery'}>
                        <GrGallery className="icon ma" /> My Gallery
                    </button>
                </div>
                <button className="btn logout mt-auto" onClick={handleLogout}> {/* Logout button */}
                    <MdLogout className="icon ma" />
                    Log Out
                </button>
            </div>

            <div className="main-content"> {/* Main content area */}
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home">
                        My Gallery <span>&#62;</span>
                    </Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? ( // Dropdown for logged-in user
                            <NavDropdown title={<span><img src="src/assets/notebook-natural-laptop-macbook.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link> // Link for non-logged-in users
                        )}
                    </Nav>
                </Navbar>

                {/* Validation message display */}
                {validationMessage && (
                    <div className="alert alert-success" role="alert">
                        {validationMessage}
                    </div>
                )}

                {/* Search bar for filtering images */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button className="filters-button">
                        <IoFilterSharp className="icon" /> Filters
                    </button>
                </div>

                <div className="image-gallery"> {/* Gallery of images */}
                    {userInfo ? (
                        currentImages.length > 0 ? (
                            currentImages.map(({ image, commentCount }) => ( // Display images with edit and delete options
                                <div key={image.imageId} className="home-image-link">
                                    <div className="home-image-container">
                                        <img src={image.imageURL} className="home-image-item" alt={image.title} />
                                        <div className="home-card-title">{image.title}</div>
                                        <div className="home-card-text">Category: {image.category}</div>
                                        <div className="home-card-text">Comments: {commentCount}</div>
                                        <div className="home-button-container">
                                            <Link to={`/UpdateImage/${image.imageId}`} className="home-button">Edit</Link> {/* Edit link */}
                                            <button onClick={() => handleDelete(image.imageId)} className="home-button">Delete</button> {/* Delete button */}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No images found.</p> // Message when no images are available
                        )
                    ) : (
                        <p>Please log in to view your gallery.</p> // Prompt for non-logged-in users
                    )}
                </div>

                {/* Pagination controls */}
                <div className="pagination-controls">
                    <button onClick={handlePrevSet} disabled={pageRange.start === 1} className="page-button">Previous</button>
                    {Array.from({ length: pageRange.end - pageRange.start + 1 }, (_, index) => (
                        <button
                            key={index + pageRange.start}
                            onClick={() => paginate(index + pageRange.start)}
                            className={`page-button ${currentPage === index + pageRange.start ? 'active' : ''}`}
                        >
                            {index + pageRange.start}
                        </button>
                    ))}
                    <button onClick={handleNextSet} disabled={pageRange.end === totalPages} className="page-button">Next</button>
                </div>
            </div>
        </div>
    );
}

export default MyGallery;
