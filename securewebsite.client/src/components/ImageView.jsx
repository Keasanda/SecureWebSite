import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Card, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import './ImageView.css';

function ImageView() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');

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

        const userId = userInfo?.userID;
        const userName = userInfo?.userName;

        const commentData = {
            ImageID: imageId,
            UserID: userId,
            UserName: userName,
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
                setFeedbackMessage('Comment added successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error adding comment:', errorData);
                setFeedbackMessage('Failed to add comment.');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setFeedbackMessage('Error adding comment.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/Comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo?.userID),
            });

            if (response.ok) {
                setComments(comments.filter(c => c.commentID !== commentId));
                setFeedbackMessage('Comment deleted successfully!');
            } else {
                setFeedbackMessage('Failed to delete comment.');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            setFeedbackMessage('Error deleting comment.');
        }
    };

    const handleEditComment = (comment) => {
        setEditCommentId(comment.commentID);
        setEditCommentText(comment.commentText);
    };

    const handleUpdateComment = async () => {
        const userId = userInfo?.userID;
        const userName = userInfo?.userName;

        const updatedComment = {
            CommentID: editCommentId,
            ImageID: imageId,
            UserID: userId,
            UserName: userName,
            CommentText: editCommentText,
            CreatedDate: new Date().toISOString()
        };

        try {
            const response = await fetch(`/api/Comments/${editCommentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedComment),
            });

            if (response.ok) {
                const updatedComments = comments.map((comment) =>
                    comment.commentID === editCommentId ? updatedComment : comment
                );
                setComments(updatedComments);
                setEditCommentId(null);
                setEditCommentText('');
                setFeedbackMessage('Comment updated successfully!');
            } else {
                setFeedbackMessage('Failed to update comment.');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            setFeedbackMessage('Error updating comment.');
        }
    };

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
                            <NavDropdown title={<span><img src="https://i.pinimg.com/564x/20/7a/b0/207ab07b0f6e2f2c663f778d83cdbb14.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
                                <NavDropdown.Item>{userInfo.userEmail}</NavDropdown.Item>
                                <NavDropdown.Item href="/LoggedInResetPassword">Reset Password</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar>
                
                {/* Conditional Rendering to Avoid Accessing null Object */}
                {image ? (
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
                ) : (
                    <p>Loading image...</p> // Placeholder while the image is being loaded
                )}

                <div className="comments-section">
                    <h1 className="commethead">Comments</h1>
                    {feedbackMessage && <Alert variant="info">{feedbackMessage}</Alert>} {/* Display feedback message */}

                    {comments.map(comment => (
                        <Card key={comment.commentID} className="mb-3">
                            <Card.Body className="comment-card-body">
                                <div className="comment-card-title">
                                    <img src="https://i.pinimg.com/564x/20/7a/b0/207ab07b0f6e2f2c663f778d83cdbb14.jpg" alt="Profile" className="comment-profile-image" />
                                    <span>{comment.userName || 'Unknown'}</span>
                                    <small className="text-muted">{new Date(comment.createdDate).toLocaleDateString()}</small>
                                </div>

                                {editCommentId === comment.commentID ? (
                                    <>
                                        <Form.Control
                                            as="textarea"
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            rows={3}
                                            className="comment-textarea"
                                        />
                                        <div className="mt-2 text-end">
                                            <Button variant="secondary" onClick={() => setEditCommentId(null)} className="me-2">Cancel</Button>
                                            <Button variant="primary" onClick={handleUpdateComment}>Save</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Card.Text>{comment.commentText}</Card.Text>
                                        {userInfo?.userID === comment.userID && (
                                            <div className="text-end">
                                                <Button variant="outline-primary" size="sm" onClick={() => handleEditComment(comment)} className="me-2">Edit</Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteComment(comment.commentID)}>Delete</Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ))}

                    <InputGroup className="mt-3 commentinput">
                        <Form.Control
                            as="textarea"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="comment-textarea"
                        />
                        <Button variant="primary" onClick={handleAddComment} className="commentbutton">Add Comment</Button>
                    </InputGroup>
                </div>
            </div>
        </div>
    );
}

export default ImageView;
