import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './Logoutpage.css';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

const LogoutPage = () => {
    return (
        <div className='container6'> {/* Flex container */}

            {/* Vertical Panel */}
            <div className="vertical-panelb bg">
                <h1>
                    <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic1" />
                </h1>
                <div className="mt-5 containn">
                    <button className="btn btn-primary navbarh ho btn-block mb-3">
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                    <button className="btn uplodBTN ho log btn-block mb-5">
                        <IoCameraOutline className="icon ma" /> Image Upload
                    </button>
                    <button className="btn navbarBTN ho btn-block mb-5">
                        <GrGallery className="icon ma" /> My Gallery
                    </button>
                </div>
            </div>

            {/* Logout Container */}
            <Container className="logout-container">
                <Row className="justify-content-center">
                    <Col md={12} lg={12}>
                        <div className="logout-card">
                            <h1>
                                <img src="src/assets/Image Gallery.png" alt="Profile" className="logopic1" />
                            </h1>
                            <hr className="divider" />
                            <p>You have successfully logged out</p>
                            <Button href="/login" className="logout-Button">
                                Back to Login
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>

        </div>
    );
};

export default LogoutPage;
