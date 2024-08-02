import { useEffect, useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState(null);
    const [images, setImages] = useState([]);

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

    return (
        <div className="content">
            <div className="sidebar">
                <header className='homelog'>Logo</header>
                <nav>
                    <ul>
                        <li className="active">Home</li>
                        <li onClick={() => window.location.href = '/dragndrop'}>Image Upload</li>
                    </ul>
                </nav>
            </div>
            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand href="#home">Home</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto"></Nav>
                        <Nav>
                            {userInfo ? (
                                <>
                                    <Nav.Link href="/logout">Logout</Nav.Link>
                                    <span className="nav-link">{userInfo.userEmail}</span>
                                </>
                            ) : (
                                <Nav.Link href="/login">Login</Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <div className="search-bar">
                    <input type="text" placeholder="Search for..." />
                    <button className="filters-button">Filters</button>
                </div>
                <div className="image-gallery row">
                    {userInfo ? (
                        <>
                            <div className="user-info">
                                <h2>Welcome, {userInfo.userName}!</h2>
                                <p>Email: {userInfo.userEmail}</p>
                            </div>
                            {images.map((image) => (
                                <div className="col-md-4 mb-4" key={image.imageId}>
                                    <div className="card">
                                        <img src={image.imageURL} className="card-img-top" alt={image.title} />
                                        <div className="card-body">
                                            <h5 className="card-title">{image.title}</h5>
                                            <p className="card-text">{image.description}</p>
                                            <p className="card-text"><small className="text-muted">Category: {image.category}</small></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className='warning'>
                            <p>Please login to view the images.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
