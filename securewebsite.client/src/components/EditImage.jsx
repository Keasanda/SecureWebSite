import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditImage() {
    const { imageId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState({ imageId: '', title: '', description: '', category: '', userId: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(`/api/ImageUpload/images/${imageId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error fetching image: ${errorData.message || response.statusText}`);
                }
                const data = await response.json();
                setImage(data);
            } catch (error) {
                console.error('Fetch image error:', error);
                setError(`Error fetching image: ${error.message}`);
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
      console.log("Submitting image data:", image); // Log the image data
      try {
        const response = await axios.put(
          `/api/ImageUpload/update-image/${imageId}`,
          image,
          {
            headers: { "Content-Type": "application/json" }
          }
        );

        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(
        //     `Error updating image: ${errorData.message || response.statusText}`
        //   );
        // }

        if(response.status == 200 )

            console.log("uodated ")

        navigate("/MyGallery");
      } catch (error) {
        // console.error('Update image error:', error);
        // setError(`Error updating image: ${error}`);
        console.error(error)
      }
    };
    

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/ImageUpload/delete-image/${imageId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error deleting image: ${errorData.message || response.statusText}`);
            }

            navigate('/MyGallery');
        } catch (error) {
            console.error('Delete image error:', error);
            setError(`Error deleting image: ${error.message}`);
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
