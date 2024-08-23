import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyGallery.css'; // Updated to use the new CSS file
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
    const [validationMessage, setValidationMessage] = useState(null);



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
    
 
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="content">
            

            <div className="vertical-panel bg p-3">
                    <h1 > < img src="src\assets\Image Gallery.png" alt="Profile" className=" logopic" ></img> </h1>
                    <div className="mt-5 contain">
                        <button       className="btn btn-primary navbarh ho btn-block mb-3"             onClick={() => window.location.href = '/Home'}>  
                     
                            <IoHomeOutline className="icon ma" /> Home
                        </button>
                        <button className="btn gallerybtn ho btn-block mb-5" onClick={() => window.location.href = '/dragndrop'}>  
                            <IoCameraOutline className="icon ma  " /> Image Upload
                        </button>

                        <button   className="btn navbarBTN ho btn-block mb-5"
                     onClick={() => window.location.href = '/MyGallery'}>  
                       
                            <GrGallery  className="icon ma  " /> My Gallery
                        </button>


                    </div>
                    <button className="btn logout  mt-auto" onClick={handleLogout}>
                        <MdLogout className="icon ma  " />
                        Log Out
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

   {/* Validation message display */}
   {validationMessage && (
        <div className="alert alert-success" role="alert">
            {validationMessage}
        </div>
    )}


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
                <Link to={`/image/${image.imageId}`} key={image.imageId} className="home-image-link">
                    <div className="home-image-container">
                        <img src={image.imageURL} className="home-image-item" alt={image.title} />
                        <div className="home-card-title-overlay">
                            <h5 className="titleov">{image.title}</h5>
                        </div>
                    </div>
                    <div className="card-body">
                        <Link to={`/edit-image/${image.imageId}`} className="btn btn-secondary ma">Edit</Link>
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
