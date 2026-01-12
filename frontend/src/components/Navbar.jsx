import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Heart,
  User,
  Search,
  Phone,
} from "lucide-react";
import { Divide as Hamburger } from "hamburger-react";

import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/logo1.png";
import baliImage from "../assets/bali.jpg";
import "../styles/Navbar.css";

export const languages = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "ne", label: "NE" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Auth & Data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [regions, setRegions] = useState([]);
  const [countriesByRegion, setCountriesByRegion] = useState({});
  const [travelTypes, setTravelTypes] = useState([]);
  const [travelOptions, setTravelOptions] = useState({});
  const [dealCategories, setDealCategories] = useState([]);
  const [dealItems, setDealItems] = useState({});

  // Navbar state
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeTravelType, setActiveTravelType] = useState(null);
  const [activeDealCategory, setActiveDealCategory] = useState(null);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showWaysToTravel, setShowWaysToTravel] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showSearchIcon, setShowSearchIcon] = useState(false);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("main");
  const [mobileActiveRegion, setMobileActiveRegion] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [move, setMove] = useState(false);

  // Language dropdown
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Fetch data
  useEffect(() => {
    axiosInstance.get("destinations/").then((res) => {
      const regionList = res.data.regions.map((r) => r.region_name);
      const map = {};
      res.data.regions.forEach((r) => {
        map[r.region_name] = r.countries.map((c) => ({
          name: c.name,
          slug: c.slug,
        }));
      });
      setRegions(regionList);
      setCountriesByRegion(map);
      setActiveRegion(regionList[0] || null);
    });

    axiosInstance.get("destinations/travel-types/").then((res) => {
      const { types, options = {} } = res.data;
      setTravelTypes(types);
      setTravelOptions(options);
      setActiveTravelType(types[0] || null);
    });

    axiosInstance.get("destinations/deals/").then((res) => {
      const { categories, offers = {} } = res.data;
      setDealCategories(categories);
      setDealItems(offers);
      setActiveDealCategory(categories[0] || null);
    });
  }, []);

  // Auth state
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, [location]);

  // Scroll icon
  useEffect(() => {
    const handleScroll = () => setShowSearchIcon(window.scrollY > 100);
    if (location.pathname !== "/") setShowSearchIcon(true);
    else window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Hide search bar on home page change
  useEffect(() => {
    if (location.pathname === "/") setShowSearchBar(false);
  }, [location.pathname]);

  // Disable scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdowns = document.querySelectorAll(".dropdown");
      if (![...dropdowns].some((el) => el.contains(e.target))) {
        setShowDestinations(false);
        setShowWaysToTravel(false);
        setShowDeals(false);
        setShowProfile(false);
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setShowProfile(false);
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const mobileBack = () => {
    if (mobileView === "countries") setMobileView("destinations");
    else setMobileView("main");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLangDropdown(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={handleLogoClick}>
            <img src={logo} alt={`${t("smart")} ${t("tms")}`} />
            <span>
              {t("smart")}
              <br />
              {t("tms")}
            </span>
          </div>

          <div className="hamburger-wrapper">
            <Hamburger
              toggled={isMobileMenuOpen}
              toggle={(t) => {
                setIsMobileMenuOpen(t);
                setMobileView("main");
              }}
              size={20}
            />
          </div>

          <nav className="navbar-links">
            {/* Destinations */}
            <div
              className="dropdown"
              onClick={() => {
                setShowDestinations(!showDestinations);
                setShowWaysToTravel(false);
                setShowDeals(false);
                setShowProfile(false);
              }}
            >
              <span className="link-item">
                {t("destinations")} <ChevronDown size={14} />
              </span>
              {showDestinations && activeRegion && (
                <div className="mega-menu-dest">
                  <div className="mega-columns">
                    {/* Regions column */}
                    <div className="column">
                      <ul>
                        {regions.map((r) => (
                          <li
                            key={r}
                            onMouseEnter={() => setActiveRegion(r)}
                            className={activeRegion === r ? "region-active" : ""}
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Countries column */}
                    <div className="column countries-column">
                      <div className="countries-subcolumns">
                        {(() => {
                          const countries = countriesByRegion[activeRegion] || [];
                          const firstCol = countries.slice(0, 6);
                          const secondCol = countries.slice(6, 12);
                          return (
                            <>
                              <ul>
                                {firstCol.map((c) => (
                                  <li key={c.slug}>
                                    <Link
                                      to={`/destinations/${c.slug}`}
                                      className="plain-link"
                                      onClick={() => setShowDestinations(false)}
                                    >
                                      {c.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <ul>
                                {secondCol.map((c) => (
                                  <li key={c.slug}>
                                    <Link
                                      to={`/destinations/${c.slug}`}
                                      className="plain-link"
                                      onClick={() => setShowDestinations(false)}
                                    >
                                      {c.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </>
                          );
                        })()}
                      </div>
                      <button
                        className={`view-all-region-btn ${move ? "move-right" : ""}`}
                        onClick={() => {
                          setMove(true);
                          setShowDestinations(false);
                          navigate(`/destinations/${activeRegion.toLowerCase()}`);
                        }}
                      >
                        {t("view_trip")} {activeRegion}
                      </button>
                    </div>
                    {/* Featured card */}
                    <div className="column image-column">
                      <div className="featured-card">
                        <img
                          src={baliImage}
                          alt={activeCountry ? activeCountry.name : activeRegion}
                          className="featured-image"
                        />
                        <div className="featured-overlay">
                          <div className="featured-title">{activeRegion}</div>
                          <div className="featured-desc">
                            {activeCountry
                              ? `${t("explore_more")} ${activeCountry.name}`
                              : `${t("explore_more")} ${activeRegion}`}
                          </div>
                          <Link
                            to={
                              activeCountry
                                ? `/destinations/${activeCountry.slug}`
                                : `/destinations/${activeRegion.toLowerCase()}`
                            }
                            className="featured-btn"
                          >
                            {t("view_trip")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ways to Travel */}
            <div
              className="dropdown"
              onClick={() => {
                setShowWaysToTravel(!showWaysToTravel);
                setShowDestinations(false);
                setShowDeals(false);
                setShowProfile(false);
              }}
            >
              <span className="link-item">
                {t("ways_to_travel")} <ChevronDown size={14} />
              </span>
              {showWaysToTravel && activeTravelType && (
                <div className="mega-menu-ways">
                  <div className="mega-columns">
                    <div className="column">
                      <ul>
                        {travelTypes.map((t) => (
                          <li
                            key={t}
                            onClick={() => setActiveTravelType(t)}
                            className={activeTravelType === t ? "active" : ""}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="column">
                      <ul>
                        {(travelOptions[activeTravelType] || []).map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="column image-column">
                      <img src={baliImage} alt={activeTravelType} />
                      <p className="image-description">
                        {t("explore_more")} <strong>{activeTravelType}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deals */}
            <div
              className="dropdown"
              onClick={() => {
                setShowDeals(!showDeals);
                setShowWaysToTravel(false);
                setShowDestinations(false);
                setShowProfile(false);
              }}
            >
              <span className="link-item">
                {t("deals")} <ChevronDown size={14} />
              </span>
              {showDeals && activeDealCategory && (
                <div className="mega-menu-deals">
                  <div className="mega-columns">
                    <div className="column">
                      <ul>
                        {dealCategories.map((d) => (
                          <li
                            key={d}
                            onClick={() => setActiveDealCategory(d)}
                            className={activeDealCategory === d ? "active" : ""}
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="column">
                      <ul>
                        {(dealItems[activeDealCategory] || []).map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="column image-column">
                      <img src={baliImage} alt={activeDealCategory} />
                      <p className="image-description">
                        {t("grab_deals_in", { category: activeDealCategory })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About Us */}
            <div className="dropdown link-item">
              <span className="dropdown-toggle">{t("about_us")}</span>
              <div className="dropdown-menu">
                <Link to="/about" className="dropdown-link">{t("our_stories")}</Link>
                <Link to="/blogs" className="dropdown-link">{t("blogs")}</Link>
                <Link to="/write" className="dropdown-link">{t("write_for_us")}</Link>
              </div>
            </div>
          </nav>

          {/* Desktop Icons */}
          <div className="navbar-icons">
            <button
              className={`search-icon ${showSearchIcon ? "visible" : "hidden"}`}
              onClick={() => setShowSearchBar((p) => !p)}
            >
              <Search size={20} />
            </button>

            {/* Language Dropdown */}
            <div
              className="language-dropdown-always"
              style={{
                position: "relative",
                display: "inline-block",
                marginLeft: "15px",
                zIndex: 2000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setShowLangDropdown((prev) => !prev)}
              >
                {i18n.language.toUpperCase()} ▼
              </button>

              {showLangDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    left: 0,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    zIndex: 3000,
                    width: "60px",
                  }}
                >
                  {languages.map((lng) => (
                    <div
                      key={lng.code}
                      style={{
                        padding: "8px 10px",
                        background: i18n.language === lng.code ? "#f0f0f0" : "transparent",
                        cursor: i18n.language === lng.code ? "default" : "pointer",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                      onClick={() => changeLanguage(lng.code)}
                    >
                      {lng.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/profile" state={{ tab: "favourites" }} className="wishlist-icon">
              <Heart size={18} />
            </Link>

            <div className="profile-dropdown dropdown">
              <User
                size={18}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (isAuthenticated) {
                    setShowProfile(!showProfile);
                    setShowDestinations(false);
                    setShowWaysToTravel(false);
                    setShowDeals(false);
                  } else navigate("/login");
                }}
              />
              {isAuthenticated && showProfile && (
                <div className="profile-menu">
                  <Link to="/profile" className="profile-item">{t("my_profile")}</Link>
                  <span onClick={handleLogout} className="profile-item">{t("logout")}</span>
                </div>
              )}
            </div>

            <Link to="/contact" className="contact-btn">{t("contact_us")}</Link>
          </div>
        </div>

        {/* Search Bar */}
        {showSearchBar && (
          <div className="search-bar-wrapper">
            <input type="text" placeholder={t("search_placeholder")} autoFocus />
            <button onClick={() => setShowSearchBar(false)} className="search-close-btn">×</button>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        className={`mobile-menu-panel ${isMobileMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-menu-header">
          {mobileView !== "main" && (
            <button className="mobile-back-btn" onClick={mobileBack}>
              <ChevronLeft size={20} /> {t("back")}
            </button>
          )}
          <span />
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Mobile Views */}
        {mobileView === "main" && (
          <ul className="mobile-menu-list">
            <li onClick={() => setMobileView("destinations")}>
              {t("destinations")} <ChevronRight size={18} />
            </li>
            <li onClick={() => setMobileView("ways")}>
              {t("ways_to_travel")} <ChevronRight size={18} />
            </li>
            <li onClick={() => setMobileView("deals")}>
              {t("deals")} <ChevronRight size={18} />
            </li>
            <li>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                {t("about_us")}
              </Link>
            </li>
            <hr className="mobile-divider" />
            <li>
              <Heart size={18} />{" "}
              <Link to="/wishlist" className="with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                {t("wishlist")}
              </Link>
            </li>
            <li>
              <User size={18} />{" "}
              <Link to="/manage-booking" className="with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                {t("manage_booking")}
              </Link>
            </li>
            <li>
              <Phone size={18} />{" "}
              <Link to="/contact" className="with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                {t("contact_us")}
              </Link>
            </li>
            <hr className="mobile-divider" />
            {!isAuthenticated ? (
              <li>
                <Link to="/login" className="with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("login")}
                </Link>
              </li>
            ) : (
              <li onClick={handleLogout}>
                {t("logout")}
              </li>
            )}
          </ul>
        )}

        {mobileView === "destinations" && (
          <>
            <h2 className="mobile-subtitle">{t("destinations")}</h2>
            <ul className="mobile-menu-list sub">
              {regions.map((r) => (
                <li
                  key={r}
                  onClick={() => {
                    setMobileActiveRegion(r);
                    setMobileView("countries");
                  }}
                >
                  {r} <ChevronRight size={18} />
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "countries" && (
          <>
            <h2 className="mobile-subtitle">{mobileActiveRegion}</h2>
            <ul className="mobile-menu-list sub">
              {(countriesByRegion[mobileActiveRegion] || []).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/destinations/${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "ways" && (
          <>
            <h2 className="mobile-subtitle">{t("ways_to_travel")}</h2>
            <ul className="mobile-menu-list sub">
              {travelTypes.map((tItem) => (
                <li key={tItem}>
                  <Link
                    to={`/ways-to-travel/${tItem.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {tItem}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "deals" && (
          <>
            <h2 className="mobile-subtitle">{t("deals")}</h2>
            <ul className="mobile-menu-list sub">
              {dealCategories.map((d) => (
                <li key={d}>
                  <Link
                    to={`/deals/${d.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
