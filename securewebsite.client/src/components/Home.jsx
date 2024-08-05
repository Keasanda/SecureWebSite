import { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 4;

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
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="content">
            <div className="sidebar">
                <header className='homelog'>Logo</header>
                <nav>
                    <ul>
                        <li className="active">Home</li>
                        <li onClick={() => window.location.href = '/dragndrop'}>Image Upload</li>
                        <li onClick={() => window.location.href = '/library'}>My Library</li>
                    </ul>
                </nav>
                <footer className='logout' onClick={() => window.location.href = '/logout'}>Logout</footer>
            </div>
            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? (
                            <NavDropdown title={<span><img src="path_to_profile_image" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/reset-password">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar>
                <div className="search-bar">
                    <input type="text" placeholder="Search for..." />
                    <button className="filters-button">Filters</button>
                </div>
                <div className="image-gallery">
                    {userInfo ? (
                        currentImages.map((image) => (
                            <div className="card" key={image.imageId}>
                                <img src={image.imageURL} className="card-img-top" alt={image.title} />
                                <div className="card-body">
                                    <h5 className="card-title">{image.title}</h5>
                                    <div className="card-actions">
                                        <i className="far fa-heart"></i>
                                        <i className="far fa-comment"></i>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='warning'>
                            <p>Please login to view the images.</p>
                        </div>
                    )}
                </div>
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        {Array.from({ length: Math.ceil(images.length / imagesPerPage) }, (_, i) => (
                            <li className="page-item" key={i + 1}>
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

export default Home;
