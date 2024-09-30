import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Card, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { IoHomeOutline, IoCameraOutline } from "react-icons/io5";
import { MdLogout, MdEdit, MdDelete } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import './ImageView.css';

function ImageView() {
    const { imageId } = useParams(); // Get the image ID from the URL parameters
    const [image, setImage] = useState(null); // State to hold the image data
    const [comments, setComments] = useState([]); // State to hold comments
    const [newComment, setNewComment] = useState(''); // State for new comment input
    const [editCommentId, setEditCommentId] = useState(null); // State to track which comment is being edited
    const [editCommentText, setEditCommentText] = useState(''); // State for editing comment text
    const [userInfo, setUserInfo] = useState(null); // State to hold user info
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback messages

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                const data = await response.json();
                setImage(data); // Set the fetched image data
            } catch (error) {
                console.error('Error fetching image:', error); // Log any errors
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/Comments/${imageId}`);
                const data = await response.json();
                setComments(data); // Set the fetched comments
            } catch (error) {
                console.error('Error fetching comments:', error); // Log any errors
            }
        };

        // Retrieve stored user information from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserInfo(user); // Set user info state
        }

        fetchImage(); // Fetch the image
        fetchComments(); // Fetch the comments
    }, [imageId]);

    // Function to handle adding a new comment
    const handleAddComment = async () => {
        if (newComment.trim() === '') return; // Prevent adding empty comments

        const userId = userInfo?.userID; // Get user ID from user info
        const userName = userInfo?.userName; // Get user name from user info

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
                body: JSON.stringify(commentData), // Send the new comment data
            });

            if (response.ok) {
                const addedComment = await response.json(); // Get the added comment
                setComments([...comments, addedComment]); // Update the comments state
                setNewComment(''); // Clear the new comment input
                setFeedbackMessage('Comment added successfully!'); // Set success message
            } else {
                const errorData = await response.json();
                console.error('Error adding comment:', errorData); // Log any errors
                setFeedbackMessage('Failed to add comment.'); // Set failure message
            }
        } catch (error) {
            console.error('Error adding comment:', error); // Log any errors
            setFeedbackMessage('Error adding comment.'); // Set error message
        }
    };

    // Function to handle user logout
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/SecureWebsite/logout", {
                method: "GET",
                credentials: "include" // Include credentials for the request
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user"); // Remove user from local storage
                window.location.href = data.redirectTo || "/login"; // Redirect to login
            } else {
                console.log("Could not logout: ", response); // Log any logout errors
            }
        } catch (error) {
            console.error('Error logging out:', error); // Log any errors
        }
    };

    // Function to handle deleting a comment
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/Comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo?.userID), // Send user ID for authentication
            });

            if (response.ok) {
                setComments(comments.filter(c => c.commentID !== commentId)); // Update comments state
                setFeedbackMessage('Comment deleted successfully!'); // Set success message
            } else {
                setFeedbackMessage('Failed to delete comment.'); // Set failure message
            }
        } catch (error) {
            console.error('Error deleting comment:', error); // Log any errors
            setFeedbackMessage('Error deleting comment.'); // Set error message
        }
    };

    // Function to initiate editing a comment
    const handleEditComment = (comment) => {
        setEditCommentId(comment.commentID); // Set the ID of the comment being edited
        setEditCommentText(comment.commentText); // Set the text of the comment being edited
    };

    // Function to handle updating a comment
    const handleUpdateComment = async () => {
        const userId = userInfo?.userID; // Get user ID
        const userName = userInfo?.userName; // Get user name

        const updatedComment = {
            CommentID: editCommentId,
            ImageID: imageId,
            UserID: userId,
            UserName: userName,
            CommentText: editCommentText,
            CreatedDate: new Date().toISOString(), // Set current date
        };

        try {
            const response = await fetch(`/api/Comments/${editCommentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedComment), // Send the updated comment data
            });

            if (response.ok) {
                const updatedComments = comments.map((comment) =>
                    comment.commentID === editCommentId ? updatedComment : comment // Update the comments state
                );
                setComments(updatedComments);
                setEditCommentId(null); // Clear the edit comment ID
                setEditCommentText(''); // Clear the edit comment text
                setFeedbackMessage('Comment updated successfully!'); // Set success message
            } else {
                setFeedbackMessage('Failed to update comment.'); // Set failure message
            }
        } catch (error) {
            console.error('Error updating comment:', error); // Log any errors
            setFeedbackMessage('Error updating comment.'); // Set error message
        }
    };

    return (
        <div className="content">
            <div className="vertical-panel bg p-3">
                <h1>
                    <img src="https://i.imgur.com/aNOZKGU.png" alt="Profile" className="logopic" />
                </h1>
                <div className="mt-5 contain">
                    <button className="btn btn-primary navbarh ho btn-block mb-3" onClick={() => window.location.href = '/Home'}>
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                    <button className="btn viewBTN ho btn-block mb-5" onClick={() => window.location.href = '/dragndrop'}>
                        <IoCameraOutline className="icon ma" /> Image Upload
                    </button>
                    <button className="btn navbarBTN ho btn-block mb-5" onClick={() => window.location.href = '/MyGallery'}>
                        <GrGallery className="icon ma" /> My Gallery
                    </button>
                </div>
                <button className="btn logout mt-auto" onClick={handleLogout}>
                    <MdLogout className="icon ma" /> Log Out
                </button>
            </div>

            <div className="main-content">
                <Navbar bg="light" expand="lg" className='homenav'>
                    <Navbar.Brand style={{ marginLeft: '25px', fontFamily: 'Poppins', fontSize: "normal" }} href="#home">
                        Home <span>&#62;</span> Image View
                    </Navbar.Brand>
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

                {image && (
                    <Card className="image-view-card">
                        <Card.Img variant="top" src={image.imageUrl} alt={image.imageTitle} />
                        <Card.Body>
                            <Card.Title>{image.imageTitle}</Card.Title>
                            <Card.Text>{image.imageDescription}</Card.Text>
                            <p>Uploaded by: {image.userName}</p>
                        </Card.Body>
                    </Card>
                )}

                <h2 className="mt-4">Comments</h2>
                {comments.map((comment) => (
                    <div key={comment.commentID} className="comment">
                        <div>
                            <strong>{comment.userName}</strong>: {comment.commentText}
                        </div>
                        {userInfo && userInfo.userID === comment.userID && (
                            <div>
                                <Button variant="outline-secondary" onClick={() => handleEditComment(comment)}>
                                    <MdEdit className="icon" /> Edit
                                </Button>
                                <Button variant="outline-danger" onClick={() => handleDeleteComment(comment.commentID)}>
                                    <MdDelete className="icon" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                <div className="feedback-message">
                    {feedbackMessage && <Alert variant="info">{feedbackMessage}</Alert>}
                </div>

                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)} // Update new comment state
                    />
                    <Button variant="primary" onClick={handleAddComment}>
                        Add Comment
                    </Button>
                </InputGroup>

                {editCommentId && (
                    <div className="edit-comment-form">
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Edit your comment"
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)} // Update edit comment text state
                            />
                            <Button variant="primary" onClick={handleUpdateComment}>
                                Update Comment
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                setEditCommentId(null); // Cancel editing
                                setEditCommentText(''); // Clear edit comment text
                            }}>
                                Cancel
                            </Button>
                        </InputGroup>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageView;
