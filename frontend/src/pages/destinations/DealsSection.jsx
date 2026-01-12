import React, { useState, useMemo, useEffect } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import "../../pagescss/deals.css";

const INITIAL_VISIBLE = 3;

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function DealsSection({ data = {} }) {
  const dealsArr = Array.isArray(data.deals) ? data.deals : [];

  const navigate = useNavigate();
  const [openGrp, setOpenGrp] = useState({ styles: true, themes: true });
  // liked: object mapping dealId -> wishlistItemId (or undefined if not liked)
  const [liked, setLiked] = useState({});
  const [loadingWishIds, setLoadingWishIds] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minDays: "",
    maxDays: "",
    styles: [],
    themes: [],
    deals: { onSale: false, lastMinute: false },
  });

  // Fetch user's wishlist on mount if token exists
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Not logged in

      try {
        const res = await axiosInstance.get("/destinations/wishlist/");
        const dealMap = {};
        res.data.results.forEach((item) => {
          dealMap[item.deal] = item.id;
        });
        setLiked(dealMap);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
        toast.error("Failed to load wishlist");
      }
    };
    fetchWishlist();
  }, []);

  // Wishlist toggle with loading indicator per dealId
  const toggleLike = async (dealId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please log in to use wishlist");
      navigate("/login");
      return;
    }

    if (loadingWishIds.has(dealId)) return; // Prevent double clicks

    setLoadingWishIds((prev) => new Set(prev).add(dealId));

    const wishlistId = liked[dealId];
    try {
      if (wishlistId) {
        // Remove from wishlist
        await axiosInstance.delete(`/destinations/wishlist/${wishlistId}/`);
        setLiked((prev) => {
          const next = { ...prev };
          delete next[dealId];
          return next;
        });
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const res = await axiosInstance.post("/destinations/wishlist/", {
          deal: dealId,
        });
        setLiked((prev) => ({
          ...prev,
          [dealId]: res.data.id,
        }));
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist error", err);
      toast.error(wishlistId ? "Failed to remove from wishlist" : "Failed to add to wishlist");
    } finally {
      setLoadingWishIds((prev) => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
    }
  };

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(t);
  }, [showAll, filters]);

  const norm = (v = "") => v.toLowerCase().trim();

  const { styleList, styleCount, themeList, themeCount } = useMemo(() => {
    const sC = {},
      tC = {};
    dealsArr.forEach((d) => {
      const sk = norm(d.style || d.Styles);
      if (sk) sC[sk] = (sC[sk] || 0) + 1;
      (d.themes || []).forEach((t) => {
        const tk = norm(t);
        if (tk) tC[tk] = (tC[tk] || 0) + 1;
      });
    });
    return {
      styleList: Object.keys(sC),
      styleCount: sC,
      themeList: Object.keys(tC),
      themeCount: tC,
    };
  }, [dealsArr]);

  const handleCheck = (group, value) =>
    setFilters((p) => {
      if (group === "styles" || group === "themes") {
        const next = new Set(p[group]);
        next.has(value) ? next.delete(value) : next.add(value);
        return { ...p, [group]: [...next] };
      }
      if (group === "deals") {
        return {
          ...p,
          deals: { ...p.deals, [value]: !p.deals[value] },
        };
      }
      return p;
    });

  const filtered = useMemo(() => {
    const {
      minPrice,
      maxPrice,
      minDays,
      maxDays,
      styles,
      themes,
      deals: flags,
    } = filters;
    return dealsArr.filter((d) => {
      const price = +String(d.price).replace(/[^0-9.]/g, "");
      const priceOK =
        (!minPrice || price >= +minPrice) && (!maxPrice || price <= +maxPrice);
      const daysOK =
        (!minDays || d.days >= +minDays) && (!maxDays || d.days <= +maxDays);
      const styleOK =
        styles.length === 0 || styles.includes(norm(d.style || d.Styles));
      const themeOK =
        themes.length === 0 ||
        (d.themes || []).map(norm).some((t) => themes.includes(t));
      const saleOK = !flags.onSale || d.on_sale === true;
      const lmOK = !flags.lastMinute || d.last_minute === true;
      return priceOK && daysOK && styleOK && themeOK && saleOK && lmOK;
    });
  }, [filters, dealsArr]);

  const display = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  if (!dealsArr.length) return null;

  return (
    <section className="deals-section" id="travel-deals">
      <h2>Top {data.title?.split(" ")[0]} Travel Deals</h2>
      <div className="deals-layout">
        {/* Filters */}
        <aside className="filters">
          <h5 className="filters__title">Duration</h5>
          <div className="range-row">
            <input
              type="number"
              placeholder="Min"
              value={filters.minDays}
              onChange={(e) =>
                setFilters({ ...filters, minDays: e.target.value })
              }
              min={0}
              aria-label="Minimum days"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxDays}
              onChange={(e) =>
                setFilters({ ...filters, maxDays: e.target.value })
              }
              min={0}
              aria-label="Maximum days"
            />
          </div>

          <h5 className="filters__title">Price</h5>
          <div className="range-row">
            <input
              type="number"
              placeholder="$ Min"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
              min={0}
              aria-label="Minimum price"
            />
            <input
              type="number"
              placeholder="$ Max"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
              min={0}
              aria-label="Maximum price"
            />
          </div>

          <h5 className="filters__title">Travel Deals</h5>
          <label>
            <input
              type="checkbox"
              checked={filters.deals.onSale}
              onChange={() => handleCheck("deals", "onSale")}
            />
            Trips on sale
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.deals.lastMinute}
              onChange={() => handleCheck("deals", "lastMinute")}
            />
            Last minute deals
          </label>

          {/* Style filter */}
          <div className="collapsible">
            <button
              className="collapsible__header"
              onClick={() => setOpenGrp((p) => ({ ...p, styles: !p.styles }))}
              aria-expanded={openGrp.styles}
              aria-controls="styles-filter"
            >
              <span>Styles</span> {openGrp.styles ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <div
              id="styles-filter"
              className={`collapsible__body ${openGrp.styles ? "open" : "closed"}`}
            >
              {styleList.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={filters.styles.includes(s)}
                    onChange={() => handleCheck("styles", s)}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                  <span className="count">{styleCount[s]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme filter */}
          <div className="collapsible">
            <button
              className="collapsible__header"
              onClick={() => setOpenGrp((p) => ({ ...p, themes: !p.themes }))}
              aria-expanded={openGrp.themes}
              aria-controls="themes-filter"
            >
              <span>Themes</span> {openGrp.themes ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <div
              id="themes-filter"
              className={`collapsible__body ${openGrp.themes ? "open" : "closed"}`}
            >
              {themeList.map((t) => (
                <label key={t}>
                  <input
                    type="checkbox"
                    checked={filters.themes.includes(t)}
                    onChange={() => handleCheck("themes", t)}
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                  <span className="count">{themeCount[t]}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Deals Grid */}
        <div className={`deals-grid ${animate ? "reveal" : ""}`}>
          {display.length > 0 ? (
            display.map((d, i) => {
              const priceNum = parseInt(d.price.replace(/[^0-9]/g, "") || "0", 10);
              const oldPrice = `$${(priceNum + 500).toLocaleString()}`;

              const isLoading = loadingWishIds.has(d.id);

              return (
                <article
                  className="deal-card screenshot"
                  key={d.id || i}
                  style={{ "--i": i }}
                >
                  <div
                    className="deal-image"
                    style={{
                      backgroundImage: `url(${d.image || "https://via.placeholder.com/300"})`,
                    }}
                  >
                    {d.tag && <span className="ribbon">{d.tag}</span>}
                    <button
                      className={`fav-btn ${liked[d.id] ? "liked" : ""}`}
                      onClick={() => toggleLike(d.id)}
                      aria-label={liked[d.id] ? "Unlike" : "Like"}
                      disabled={isLoading}
                    >
                      {liked[d.id] ? <FaHeart /> : <FaRegHeart />}
                    </button>

                    <div className="deal-overlay sc">
                      <h3>{d.title}</h3>
                      <p className="excerpt">
                        {(d.description && d.description.length > 100
                          ? d.description.slice(0, 100) + "..."
                          : d.description) || "Explore this amazing travel deal."}
                      </p>
                      <div className="badge-row">
                        <span className="info-badge">{d.days} days</span>
                        {(d.themes || []).map((theme, idx) => (
                          <span key={idx} className="info-badge second">
                            {theme}
                          </span>
                        ))}
                      </div>
                      <div className="bottom-row">
                        <button
                          className="deal-btn small"
                          onClick={() =>
                            navigate(
                              `/destinations/${data.slug || data.title
                                ?.split(" ")[0]
                                .toLowerCase()}/deal/${slugify(d.title)}`
                            )
                          }
                        >
                          See Details
                        </button>
                        <div className="price-wrap">
                          <span className="old-price">{oldPrice}</span>
                          <span className="new-price">{d.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p>No trips match your filters.</p>
          )}
        </div>
      </div>

      {/* View More */}
      {filtered.length > INITIAL_VISIBLE && (
        <div className="view-more-wrapper">
          <button
            className="view-more-btn"
            onClick={() => {
              setShowAll((prev) => {
                const next = !prev;
                if (!next) {
                  setTimeout(() => {
                    const el = document.getElementById("travel-deals");
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }, 100);
                }
                return next;
              });
            }}
            aria-expanded={showAll}
          >
            {showAll ? "View less ▲" : "View more trips ▼"}
          </button>
        </div>
      )}
    </section>
  );
}
