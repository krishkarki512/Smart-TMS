import baliImg from "../assets/bali.jpg"; // Placeholder image

const countryList = Object.values({
  'Central Asia & China': ['Kyrgyzstan', 'Uzbekistan'],
  'Europe & the Caucasus': ['Albania', 'Georgia', 'Turkey (Türkiye)'],
  'Indian Subcontinent': ['India', 'Sri Lanka', 'Pakistan'],
  'Latin America': ['Guatemala', 'Brazil', 'Argentina'],
  'North Africa & Middle East': ['Egypt', 'Oman', 'Jordan'],
  'South East Asia & Pacific': ['Vietnam', 'Indonesia', 'Philippines'],
  'Sub Saharan Africa': ['South Africa', 'Kenya', 'Uganda'],
}).flat();

const destinations = {};

countryList.forEach((country) => {
  const key = country.toLowerCase().replace(/\s|\(|\)|[^a-z]/gi, '');
  destinations[key] = {
    title: `${country} Tours & Holidays`,
    subtitle: "Explore with confidence",
    image: baliImg,
    sectionTitle: `Discover the beauty of ${country}`,
    description: `${country} Embark on an unforgettable journey where every moment is carefully crafted to immerse you in the rich tapestry of culture, cuisine, natural beauty, and history. Our travel experiences go beyond sightseeing — they offer meaningful connections with local communities, expert-guided tours through iconic landmarks and hidden gems, and personalized packages tailored to your interests. Whether you're savoring authentic local dishes, exploring ancient ruins, trekking through scenic landscapes, or engaging in traditional festivals, our curated trips ensure that you don't just visit a place — you live it. Discover the world with depth, comfort, and a sense of adventure like never before.`,
    deals: null,
  };

  // Travel Deals for Vietnam
  if (country === "Vietnam") {
    destinations[key].deals = [
      {
        title: "Classic Vietnam",
        days: 10,
        price: "$2,899",
        image: baliImg,
        themes: ["Food", "Culture"],
        tag: "Signature Trip",
      },
      {
        title: "Northern Vietnam Adventure",
        days: 8,
        price: "$2,499",
        image: baliImg,
        themes: ["Trekking", "Nature"],
        tag: "Special Deal",
      },
      {
        title: "Highlights of Vietnam",
        days: 14,
        price: "$3,499",
        image: baliImg,
        themes: ["Family", "City"],
      },
    ];
  }

  // Full Travel Deals for Kyrgyzstan
  if (country === "Kyrgyzstan") {
    destinations[key].deals = [
      { 
        title: "Nomadic Kyrgyzstan",
        days: 12,
        price: "$2,799",
        image: baliImg,
        themes: ["Culture", "Adventure"],
       deals: "Trips on sale",
       Styles:'Basic',
      },
      {
        title: "Mountains & Lakes",
        days: 9,
        price: "$2,399",
        image: baliImg,
        themes: ["Nature", "Trekking"],
        tag: "Special Deal",
      },
      {
        title: "Silk Road Odyssey",
        days: 14,
        price: "$3,199",
        image: baliImg,
        themes: ["History", "Culture"],
        tag: "Signature Trip",
      },
      {
        title: "Kyrgyz Summer Retreat",
        days: 10,
        price: "$2,899",
        image: baliImg,
        themes: ["Food", "Nature"],
      },
      {
        title: "Highlands Explorer",
        days: 11,
        price: "$3,099",
        image: baliImg,
        themes: ["Trekking", "Scenic"],
        tag: "Signature Trip",
      },
    ];
  }
});

export default destinations;
