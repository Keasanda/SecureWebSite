import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditImage() {
    const { imageId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState({ title: '', description: '', category: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                const data = await response.json();
                setImage(data);
            } catch (error) {
                setError('Error fetching image');
            }
        };

        fetchImage();
    }, [imageId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setImage((prevImage) => ({ ...prevImage, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/ImageUpload/update-image/${imageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(image)
            });

            if (response.ok) {
                navigate('/MyGallery');
            } else {
                const errorData = await response.json();
                setError(`Error updating image: ${errorData.message}`);
            }
        } catch (error) {
            setError('Error updating image');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                navigate('/MyGallery');
            } else {
                const errorData = await response.json();
                setError(`Error deleting image: ${errorData.message}`);
            }
        } catch (error) {
            setError('Error deleting image');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Edit Image</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={image.title}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={image.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="category">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={image.category}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Update Image</button>
                <button type="button" onClick={handleDelete}>Delete Image</button>
            </form>
        </div>
    );
}

export default EditImage;
