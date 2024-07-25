import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user && user.email) {
                fetch(`/api/SecureWebsite/home/${user.email}`, {
                    method: "GET",
                    credentials: "include"
                })
                .then(response => response.json())
                .then(data => {
                    setUserInfo(data.userInfo);
                    console.log("User info: ", data.userInfo);
                })
                .catch(error => {
                    console.log("Error on home page: ", error);
                });
            }
        }
    }, []);

    return (
        <div className="content">
            <div className="sidebar">
                <header className='homelog'>Logo</header>
                <nav>
                    <ul>
                        <li className="active">Home</li>
                        <li onClick={() => window.location.href = '/dragndrop'} className="homeImgeup">Image Upload</li>
                    </ul>
                </nav>
            </div>

            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand href="#home">Home </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home"></Nav.Link>
                            <Nav.Link href="#image-upload"></Nav.Link>
                        </Nav>
                        <Nav>
                            {userInfo ? (
                                <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                                    <NavDropdown.Item href="#action/3.1">{userInfo.email}</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.2">Reset Password</NavDropdown.Item>
                                </NavDropdown>
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
                        Array.from({ length: 2 }, (_, index) => (
                            <div className="col-md-5 to" key={index}>
                                <div className="card to">
                                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" className="card-img-top" alt="Butterfly" />
                                    <div className="card-body">
                                        <h5 className="card-title">Butterfly</h5>
                                        <p className="card-text">Butterflies have taste receptors on their feet to help them find their host plants and locate food. A female butterfly lands on different plants, drumming the leaves with her feet until the plant releases its juices.</p>
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
            </div>
        </div>
    );
}

export default Home;
