import React, { useEffect, useState } from 'react';

const FacebookPosts = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [pending, setPending] = useState([]);
  const [link, setLink] = useState('');
  const isAdmin = Boolean(token);

  const fetchApproved = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch approved posts:", error);
    }
  };

  const fetchPending = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/posts/pending', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      setPending(data);
    } catch (error) {
      console.error("Failed to fetch pending posts:", error);
    }
  };

  useEffect(() => {
    fetchApproved();
    if (token) {
      fetchPending();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facebook_link: link })
    });
    setLink('');
    alert('Submission received, awaiting approval.');
  };

  const handleApprove = async (id) => {
    await fetch(`/api/posts/approve/${id}`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
    await fetchApproved();
    await fetchPending();
  };

  // Helper function to create the iframe for a post
  const renderPost = (post) => {
    const encodedLink = encodeURIComponent(post.facebook_link);
    const iframeSrc = `https://www.facebook.com/plugins/post.php?href=${encodedLink}&show_text=true&width=500`;

    return (
      <iframe
        src={iframeSrc}
        width="500"
        height="660"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title={`Facebook Post: ${post.id}`}
      ></iframe>
    );
  };

  return (
    <>
      <div className="container">
        <h2>Facebook Posts</h2>
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter Facebook post link to submit for approval"
            required
          />
          <button type="submit" className="btn">Submit</button>
        </form>

        <h3>Approved Posts</h3>
        <div className="posts-grid">
          {posts.map((p) => (
            <div className="card" key={p.id}>
              {renderPost(p)}
            </div>
          ))}
        </div>

        {isAdmin && (
          <>
            <h3>Pending Approval</h3>
            {pending.length > 0 ? (
              <div className="posts-grid">
                {pending.map((p) => (
                  <div className="card" key={p.id}>
                    {renderPost(p)}
                    <div className="admin-actions">
                      <button onClick={() => handleApprove(p.id)} className="btn">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>No pending posts.</p>}
          </>
        )}
      </div>
    </>
  );
};

export default FacebookPosts;