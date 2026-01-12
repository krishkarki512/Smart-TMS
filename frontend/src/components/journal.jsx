import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/journal.css";

export default function Journal() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/blogs/?limit=3")
      .then((res) => {
        setBlogs(res.data.results || res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch blogs", err);
      });
  }, []);

  const handleViewAll = () => {
    navigate("/blogs");
  };

  return (
    <section className="journal-section" style={{ position: "relative" }}>
      <h2 className="journal-title">Travel journal</h2>
      <div className="underline journal" />
      <p className="journal-description">
        Read inspiring stories and insights from our seasoned travelers.
      </p>

      <div className="journal-grid">
        {blogs.map((blog) => (
          <article key={blog.id} className="journal-card">
            {blog.category && <div className="journal-badge">{blog.category.name}</div>}
            <img src={blog.thumbnail} alt={blog.title} className="journal-img" />
            <div className="journal-date">
              <FaCalendarAlt className="calendar-icon" />{" "}
              {new Date(blog.created_at).toLocaleDateString()}
            </div>
            <h3 className="journal-card-title">{blog.title}</h3>
            <p className="journal-card-description">
              {blog.content.slice(0, 100)}...
            </p>
            <div
              className="read-more"
              onClick={() => navigate(`/blogs/${blog.slug}`)}
              style={{ cursor: "pointer" }}
            >
              Read more <IoIosArrowForward />
            </div>
          </article>
        ))}
      </div>

      <div className="view-all-wrapper">
        <button className="view-all-btn" onClick={handleViewAll}>
          View all articles <IoIosArrowForward />
        </button>
      </div>
    </section>
  );
}
