import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AllDestinations.css";
import AOS from "aos";
import "aos/dist/aos.css";

import fallbackImage from "../assets/img2.jpg";
import baliImage from "../assets/bali.jpg";

const AllDestinations = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [destinationPage, setDestinationPage] = useState(1);
  const destinationsPerPage = 3;

  // Helper: get random country image from a region's countries
  const getRandomCountryImage = (countries) => {
    if (!countries || countries.length === 0) return fallbackImage;
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex].image || fallbackImage;
  };

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchRegions = async () => {
      try {
        const res = await axiosInstance.get("/destinations/regions/with-countries/");
        setRegions(res.data);
      } catch (err) {
        console.error("Failed to fetch regions", err);
      }
    };

    fetchRegions();
  }, []);

  // Collect all countries from all regions
  const allCountries = regions.flatMap((region) => region.countries || []);
  const topDestinations = allCountries.slice(0, 10);
  const totalDestinationPages = Math.ceil(topDestinations.length / destinationsPerPage);

  return (
    <div className="all-destinations">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>&gt;</span> <span>All Destinations</span>
      </div>

      <div className="header-image" style={{ backgroundImage: `url(${baliImage})` }}>
        <div className="overlay">
          <h1>All Destinations</h1>
        </div>
      </div>

      <div className="intro-text" data-aos="fade-up">
        <p>
          Discover a world of adventure, culture, and unforgettable memories. Choose your continent and start exploring today.
        </p>
      </div>

      <h2 className="section-title">Where You Can Go?</h2>
      <div className="section-underline"></div>

      <div className="continent-grid">
        {regions.map((region) => (
          <div className="continent-card" key={region.id} data-aos="zoom-in">
            <img
              src={getRandomCountryImage(region.countries)}
              alt={region.name}
            />
            <div className="continent-info">
              <h3>{region.name}</h3>
              <p>{region.countries?.length || 0} countries</p>
              <button onClick={() => navigate("/search?region=" + region.id)}>See More</button>
            </div>
          </div>
        ))}
      </div>

      {/* Top Destinations */}
      <div className="top-destinations-slider" data-aos="fade-up">
        <h2>Our Top Destinations</h2>
        <p>
          Most loved places by travelers. Whether you're into history, adventure, or food, these spots have something special.
        </p>

        <div className="top-destinations-row" data-aos="fade-up">
          {topDestinations
            .slice(
              (destinationPage - 1) * destinationsPerPage,
              destinationPage * destinationsPerPage
            )
            .map((country) => (
              <div className="slide-card" key={country.id}>
                <img src={country.image || fallbackImage} alt={country.name} />
                <div className="slide-content">
                  <h3>{country.name}</h3>
                  <p className="country">Explore Now</p>
                  <p className="desc">
                    {country.description ||
                      `Discover unique experiences in ${country.name}`}
                  </p>
                  <button
                    className="trip-btn"
                    onClick={() => navigate(`/destinations/${country.slug}`)}
                  >
                    Trips in {country.name}
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="pagination-center">
          <button
            disabled={destinationPage === 1}
            onClick={() => setDestinationPage(destinationPage - 1)}
          >
            &laquo;
          </button>
          <span>
            Page {destinationPage} of {totalDestinationPages}
          </span>
          <button
            disabled={destinationPage === totalDestinationPages}
            onClick={() => setDestinationPage(destinationPage + 1)}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllDestinations;
