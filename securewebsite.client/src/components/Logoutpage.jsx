import React from 'react'; // Import React library
import { Container, Row, Col, Button } from 'react-bootstrap'; // Import Bootstrap components
import './Logoutpage.css'; // Import CSS for styling
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5"; // Import home and camera icons
import { GrGallery } from "react-icons/gr"; // Import gallery icon

const LogoutPage = () => {
    return (
        <div className='container6'> {/* Main container for the Logout page */}

            {/* Vertical Panel for navigation */}
            <div className="vertical-panelb bg">
                <h1>
                    <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic1" /> {/* Logo image */}
                </h1>
                <div className="mt-5 containn"> {/* Container for buttons */}
                    <button className="btn btn-primary navbarh ho btn-block mb-3">
                        <IoHomeOutline className="icon ma" /> Home {/* Home button with icon */}
                    </button>
                    <button className="btn uplodBTN ho log btn-block mb-5">
                        <IoCameraOutline className="icon ma" /> Image Upload {/* Image Upload button with icon */}
                    </button>
                    <button className="btn navbarBTN ho btn-block mb-5">
                        <GrGallery className="icon ma" /> My Gallery {/* My Gallery button with icon */}
                    </button>
                </div>
            </div>

            {/* Logout Container displaying logout message */}
            <Container className="logout-container">
                <Row className="justify-content-center"> {/* Center align the content */}
                    <Col md={12} lg={12}>
                        <div className="logout-card"> {/* Card for logout message */}
                            <h1>
                                <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic1" /> {/* Logo image */}
                            </h1>
                            <hr className="divider" /> {/* Divider line */}
                            <p>You have successfully logged out</p> {/* Logout message */}
                            <Button href="/login" className="logout-Button"> {/* Button to navigate back to login */}
                                Back to Login
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>

        </div>
    );
};

export default LogoutPage; // Export the LogoutPage component
