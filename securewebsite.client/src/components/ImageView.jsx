import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ImageView.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

function ImageView() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                const data = await response.json();
                setImage(data);
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/Comments/${imageId}`);
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user);
        }

        fetchImage();
        fetchComments();
    }, [imageId]);

    const handleAddComment = async () => {
        if (newComment.trim() === '') return;
    
        const userId = userInfo?.userID; // Ensure this matches the backend's expectation
    
        const commentData = {
            ImageID: imageId,              
            UserID: userId,                
            CommentText: newComment,
        };
    
        try {
            const response = await fetch('/api/Comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData),
            });
    
            if (response.ok) {
                const addedComment = await response.json();
                setComments([...comments, addedComment]);
                setNewComment('');
            } else {
                const errorData = await response.json();
                console.error('Error adding comment:', errorData);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/Comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userInfo?.userID }), // Ensure this matches the backend's expectation
            });

            if (response.ok) {
                setComments(comments.filter(c => c.commentID !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (!image) {
        return <div>Loading...</div>;
    }

    return (
        <div className="content">
            <div className="sidebarHome">
                <header className='homelog'>Logo</header>
                <nav className="navButoom">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>
                            <button className="nav-buttonHome active">
                                <IoHomeOutline className="icon hm" />
                                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome" onClick={() => window.location.href = '/dragndrop'}>
                                <IoCameraOutline className="icon hm" /> Image Upload
                            </button>
                        </li>
                        <li>
                            <button className="nav-buttonHome myLb" onClick={() => window.location.href = '/MyGallery'}>
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
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home"> Home <span>&#62;</span> Image View </Navbar.Brand>
                    <Nav className="me-auto"></Nav>
                    <Nav>
                        {userInfo ? (
                            <NavDropdown title={<span><img src="assets\notebook-natural-laptop-macbook.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar>
                <div className="image-view">
                    <div className="image-container">
                        <img src={image.imageURL} alt={image.title || 'Image'} />
                        <div className="overlay">
                            <h2>{image.title || 'Untitled'}</h2>
                            <p>{image.description || 'No description available.'}</p>
                            <p><strong>Category:</strong> {image.category || 'Uncategorized'}</p>
                        </div>
                        <Link to="/home" className="close-button">X</Link>
                    </div>
                </div>

                <div className="comments-section">
                    <h3>Comments</h3>
                    <ul>
                        {comments.map(comment => (
                            <li key={comment.commentID}>
                                <p><strong>{comment.user?.userName || 'Unknown'}</strong>: {comment.commentText}</p>
                                <p><small>{new Date(comment.createdDate).toLocaleString()}</small></p>
                                {comment.userID === userInfo?.userID && (
                                    <button onClick={() => handleDeleteComment(comment.commentID)}>Delete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="add-comment">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button onClick={handleAddComment}>Post Comment</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageView;
