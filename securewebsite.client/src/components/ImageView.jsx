import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ImageView.css';

function ImageView() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);

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

        fetchImage();
    }, [imageId]);

    if (!image) {
        return <div>Loading...</div>;
    }

    return (
        <div className="image-view">
            <div className="image-container">
                <img src={image.imageURL} alt={image.title} />
                <div className="overlay">
                    <h2>{image.title}</h2>
                    <p>{image.description}</p>
                </div>
            </div>
        </div>
    );
}

export default ImageView;
