import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import "../styles/write.css";

const FaqDropdown = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <div className="faq-title" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <RiArrowDropDownLine
          className={`dropdown-icon ${open ? "rotated" : ""}`}
          size={24}
        />
      </div>
      {open && <div className="faq-content">{children}</div>}
    </div>
  );
};

export default function BecomeContributor() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, countryRes] = await Promise.all([
          axiosInstance.get("/blogs/categories/"),
          axiosInstance.get("/destinations/countries/"),
        ]);
        setCategories(catRes.data.results || []);
        setCountries(countryRes.data.results || []);
      } catch {
        toast.error("Failed to load categories or countries");
      }
    };
    fetchInitialData();
  }, []);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.trim().length < 300) {
      toast.error("Content must be at least 300 characters.");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("tags", tags);
    if (country) {
      formData.append("country", country);
    }
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      await axiosInstance.post("/blogs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog post submitted successfully!");
      navigate("/blogs");
    } catch {
      toast.error("Submission failed");
    }
  };

  return (
    <div className="contributor-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> <span className="arrow">›</span>
        <span>Become a Contributor</span>
      </nav>

      <div className="contributor-content">
        <h1>Become a Contributor</h1>
        <p className="intro">So, you want to write for The Good Times? Great!</p>
        <p className="short-desc">
          We’re always eager to hear from travellers who are interested in
          sharing their travel tales and passion for the good life.
        </p>

        <FaqDropdown title="📌 Rules & What You Can Post">
          <ul>
            <li>✅ Original travel experiences, tips, reflections</li>
            <li>✅ Stories from Intrepid tours or personal journeys</li>
            <li>❌ No plagiarized content or promotional material</li>
            <li>✅ Photos must be owned by you or credited properly</li>
          </ul>
        </FaqDropdown>

        <FaqDropdown title="🧭 What we’re looking for">
          <ul>
            <li><strong>Good Stories</strong> – Unique experiences & travel narratives</li>
            <li><strong>Good Trips</strong> – Adventures, challenges, and highlights</li>
            <li><strong>Good Life</strong> – Food, culture, people, personal growth</li>
            <li><strong>Good Ideas</strong> – Travel tips, reflections, insights</li>
          </ul>
        </FaqDropdown>

        <form className="contributor-form" onSubmit={handleSubmit}>
          <label>
            Title<span className="required">*</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title"
            />
          </label>

          <label>
            Category<span className="required">*</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Optional: Select a country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Content (Min. 300 characters)<span className="required">*</span>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </label>

          <label>
            Tags
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="travel, adventure, food"
            />
          </label>

          <label>
            Upload Thumbnail
            <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          </label>

          {thumbnailPreview && (
            <div className="image-preview">
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="preview-img"
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            Submit Blog Post
          </button>
        </form>
      </div>
    </div>
  );
}
