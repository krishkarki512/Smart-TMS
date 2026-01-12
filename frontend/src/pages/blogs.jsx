import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import axiosInstance from "../utils/axiosInstance";  // use your custom axiosInstance here
import bali from "../assets/bali.jpg";
import img2 from "../assets/img2.jpg";
import "../styles/blogs.css";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch blogs and categories from backend API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs/");
        setBlogs(response.data.results || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/blogs/categories/");
        setCategories(response.data.results || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBlogs(), fetchCategories()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Sync selectedCategory with URL query param "category"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    setSelectedCategory(categoryParam ? Number(categoryParam) : null);
  }, [location.search]);

  // Update URL when selectedCategory changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (selectedCategory === null) {
      params.delete("category");
    } else {
      params.set("category", selectedCategory);
    }

    // Only update URL if it differs
    if (params.toString() !== location.search.replace(/^\?/, "")) {
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [selectedCategory, location.pathname, location.search, navigate]);

  // Filter blogs by search and selected category
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? blog.category?.id === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchTerm, selectedCategory]);

  // Count blogs per category for sidebar
  const categoryCounts = useMemo(() => {
    return Array.isArray(categories)
      ? categories.map((cat) => {
          const count = blogs.filter(
            (blog) => blog.category && blog.category.id === cat.id
          ).length;
          return { ...cat, count };
        })
      : [];
  }, [categories, blogs]);

  return (
    <div className="blog-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> <span className="arrow">›</span>
        <span>About us</span>
      </nav>

      {/* Main 850px Content */}
      <div className="blog-inner">
        <div className="top-banner">
          <img src={bali} alt="bali" className="banner-image" />
          <h1 className="banner-title">
            <span className="indent-2">on</span>
            <br />
            <span className="indent-1">the</span>
            <br />
            <span className="indent-0">blog</span>
          </h1>
        </div>

        <div className="text-image-aligned">
          <div className="text-side">
            <p className="blog-text">
              Golden Leaf Travels is committed to curating unforgettable journeys for every traveler. With a passion for exploration and a dedication to service, we craft experiences that go beyond the ordinary—from the pristine beaches of Bali to the cultural heart of Europe.
            </p>
            <p className="blog-text">
              Our travel experts ensure that every itinerary is personalized, seamless, and filled with wonder. Whether you're chasing adventure, relaxation, or discovery, Golden Leaf Travels is your trusted partner in exploring the world.
            </p>
          </div>
          <div className="image-side">
            <img src={img2} alt="Golden Journey" className="aligned-image" />
          </div>
        </div>

        <div className="bottom-columns">
          <p>Golden Leaf Travels offers custom packages tailored to your preferences—from luxury stays to offbeat paths.</p>
          <p>Experience expert-guided tours, 24/7 support, and exclusive deals with a travel agency you can rely on.</p>
          <p>Start your next adventure with us and turn travel dreams into lifetime memories.</p>
        </div>
      </div>

      {/* Testimonials Section (Renamed to Blog Section) */}
      <div className="testimonial-section">
        <h2 className="testimonial-title">What People Says</h2>
        <div className="testimonial-container">
          {/* Left Blog Cards */}
          <div className="testimonial-left">
            {loading ? (
              <p>Loading blogs...</p>
            ) : filteredBlogs.length ? (
              filteredBlogs.map((blog, index) => (
                <div className="testimonial-card" key={blog.id}>
                  {blog.thumbnail ? (
                    <img src={blog.thumbnail} alt={blog.title} className="testimonial-image" />
                  ) : (
                    <div className="testimonial-image" style={{backgroundColor: "#ccc", height: "150px"}}>No Image</div>
                  )}
                  <div className="testimonial-info">
                    <div className="author-block">
                      {blog.author?.profile_image ? (
                        <img
                          src={blog.author.profile_image}
                          alt={blog.author.username}
                          className="author-img"
                        />
                      ) : (
                        <div className="author-img" style={{backgroundColor: "#bbb"}}>A</div>
                      )}
                      <div className="author-info">
                        <span className="author-name">{blog.author?.username || "Unknown Author"}</span>
                        <small className="author-job">{blog.category_details?.name || "Uncategorized"}</small>
                      </div>
                    </div>
                    <h3>{blog.title}</h3>
                    <p>{blog.content.substring(0, 120)}...</p>
                    <Link to={`/blogs/${blog.slug}`} className="explore-btn">
                      Explore More <span>↗</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No blogs found matching your search.</p>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="testimonial-right">
            {/* Search Box */}
            <div className="search-box">
              <h3>Search</h3>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search blog titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button>
                  <CiSearch size={20} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="categories">
              <h3>Categories</h3>
              <ul>
                <li
                  style={{
                    cursor: "pointer",
                    fontWeight: selectedCategory === null ? "bold" : "normal",
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  ✶ All <span>{blogs.length}</span>
                </li>
                {categoryCounts.length > 0 ? (
                  categoryCounts.map((cat) => (
                    <li
                      key={cat.id}
                      style={{
                        cursor: "pointer",
                        fontWeight: selectedCategory === cat.id ? "bold" : "normal",
                      }}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      ✶ {cat.name} <span>{cat.count}</span>
                    </li>
                  ))
                ) : (
                  <li>No categories available.</li>
                )}
              </ul>
            </div>

            {/* Recent Posts */}
            <div className="recent-posts">
              <h3>Recent Posts</h3>
            <ul>
              {blogs.slice(0, 4).map((recent) => (
                <li
                  key={recent.id}
                  onClick={() => navigate(`/blogs/${recent.slug}`)}
                  style={{ cursor: "pointer" }}
                >
                  {recent.thumbnail ? (
                    <img src={recent.thumbnail} alt="Recent Post" />
                  ) : (
                    <div className="recent-post-placeholder">No Image</div>
                  )}
                  <div>
                    <span>📅 {new Date(recent.created_at).toLocaleDateString()}</span>
                    <p>{recent.title}</p>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
