import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { IoFilterSharp, IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

function Home() {
    document.title = "Welcome";
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
        }

        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('api/ImageUpload/images');
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
        
        
                <nav  className="navButoom">
                    <ul>
                        <li>
                            <button className="nav-button active">
                                
                            <IoHomeOutline className="icon ma" />     
                                Home</button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/dragndrop'}>
                            <IoCameraOutline className="icon ma" />         Image Upload</button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={() => window.location.href = '/MyGallery'}>         <GrGallery className="icon ma  " /> My Library</button>
                        </li>
                    </ul>
                </nav>


                <button className='logout' onClick={() => window.location.href = '/logout'}>
                <MdLogout className="icon ma  " />    Logout</button>
            </div>

        
            
            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px' }} href="#home">Home</Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? (
                            <NavDropdown title={<span><img src="src\assets\notebook-natural-laptop-macbook.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
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
