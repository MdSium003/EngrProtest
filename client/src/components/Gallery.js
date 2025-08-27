import React, { useEffect, useState } from 'react';

const Gallery = ({ token }) => {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const isAdmin = Boolean(token);

  const fetchImages = async () => {
    const res = await fetch('/api/images');
    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ image_url: imageUrl, caption })
    });
    setImageUrl('');
    setCaption('');
    fetchImages();
  };

  return (
    <div>
      <h2>Gallery</h2>
      {isAdmin && (
        <form onSubmit={handleAdd} className="form-container">
          <input type="url" placeholder="Direct image URL (https://...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
          <input type="text" placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button type="submit" className="btn">Add Image</button>
        </form>
      )}

      <div className="gallery-grid">
        {images.map((img) => (
          <div className="gallery-item card" key={img.id}>
            <img src={img.image_url} alt={img.caption || 'Gallery item'} />
            {img.caption && <p>{img.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;