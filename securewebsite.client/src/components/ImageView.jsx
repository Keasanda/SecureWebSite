import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Card, Button, Form, InputGroup } from 'react-bootstrap';
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
                body: JSON.stringify(userInfo?.userID),
            });
    
            if (response.ok) {
                setComments(comments.filter(c => c.commentID !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleEditComment = (comment) => {
        setEditCommentId(comment.commentID);
        setEditCommentText(comment.commentText);
    };

    const handleUpdateComment = async () => {
        if (editCommentText.trim() === '') return;

        const updatedComment = {
            commentID: editCommentId,
            UserID: userInfo?.userID,
            CommentText: editCommentText,
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
                setComments(comments.map(comment => 
                    comment.commentID === editCommentId ? { ...comment, commentText: editCommentText } : comment
                ));
                setEditCommentId(null);
                setEditCommentText('');
            } else {
                const errorData = await response.json();
                console.error('Error updating comment:', errorData);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
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
                            <NavDropdown title={<span><img src="https://i.pinimg.com/564x/20/7a/b0/207ab07b0f6e2f2c663f778d83cdbb14.jpg" alt="Profile" className="profile-image" /> {userInfo.userName}</span>}>
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
                    <h1 className="commethead">Comments</h1>
                    {comments.map(comment => (
    <Card key={comment.commentID} className="mb-3">
        <Card.Body className="comment-card-body">
            {/* Card Title at the top */}
            <div className="comment-card-title">
                <img src="https://i.pinimg.com/564x/20/7a/b0/207ab07b0f6e2f2c663f778d83cdbb14.jpg" alt="Profile" className="comment-profile-image" />
                <span>{comment.user?.userName || 'Unknown'}</span>
                <small className="text-muted" style={{ marginLeft: '10px' }}>
                    {new Date(comment.createdDate).toLocaleString()}
                </small>
            </div>

            {/* Card Text in the middle */}
            <div className="comment-card-text">
                {editCommentId === comment.commentID ? (
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                        />
                        <Button variant="primary"   onClick={handleUpdateComment}>Save</Button>
                        <Button variant="secondary" onClick={() => setEditCommentId(null)}>Cancel</Button>
                    </InputGroup>
                ) : (
                    <p>{comment.commentText}</p>
                )}
            </div>

            {/* Edit and Delete Buttons at the bottom */}
            {comment.userID === userInfo?.userID && (
                <div className="comment-card-buttons">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEditComment(comment)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteComment(comment.commentID)}>Delete</Button>
                </div>
            )}
        </Card.Body>
    </Card>
))}


                    <InputGroup className="mt-4">
                        <Form.Control
                            as="textarea"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <Button variant="primary" onClick={handleAddComment}>Post Comment</Button>
                    </InputGroup>
                </div>
            </div>
        </div>
    );
}

export default ImageView;
