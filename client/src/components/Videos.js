import React, { useEffect, useState } from 'react';

// Access the backend URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

const Videos = ({ token }) => {
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const isAdmin = Boolean(token);

  /**
   * Converts a regular YouTube URL into an embeddable URL.
   * @param {string} url - The original YouTube URL.
   * @returns {string|null} The embeddable URL or null if the ID can't be found.
   */
  const getYouTubeEmbedUrl = (url) => {
    let videoId = null;
    try {
      // Tries to match youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID formats
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      if (match) {
        videoId = match[1];
      }
    } catch (error) {
      console.error("Could not parse YouTube URL", error);
      return null;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const fetchVideos = async () => {
    // Use the full URL
    const res = await fetch(`${API_URL}/api/videos`);
    const data = await res.json();
    setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    // Use the full URL
    await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ video_url: videoUrl, title })
    });
    setVideoUrl('');
    setTitle('');
    fetchVideos();
  };

  return (
    <div className="container">
      <h2>Videos</h2>
      {isAdmin && (
        <form onSubmit={handleAdd}>
          <input type="url" placeholder="Video URL (YouTube, etc.)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
          <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button type="submit">Add</button>
        </form>
      )}

      {videos.map((v) => {
        const embedUrl = getYouTubeEmbedUrl(v.video_url);
        if (!embedUrl) {
          // Fallback for non-YouTube links or parsing errors
          return (
            <div className="card" key={v.id}>
              {v.title && <h4>{v.title}</h4>}
              <a href={v.video_url} target="_blank" rel="noreferrer">{v.video_url}</a>
            </div>
          );
        }
        return (
          <div className="card" key={v.id}>
            {v.title && <h4>{v.title}</h4>}
            <div className="video-responsive">
              <iframe
                width="560"
                height="315"
                src={embedUrl}
                title={v.title || 'YouTube video player'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Videos;
