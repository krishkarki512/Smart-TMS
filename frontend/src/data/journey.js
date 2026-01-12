import baliImg from "../assets/bali.jpg";
import parisImg from "../assets/bali.jpg";
import tokyoImg from "../assets/img2.jpg";
import maldivesImg from "../assets/img2.jpg";
import icelandImg from "../assets/bali.jpg";
import newyorkImg from "../assets/bali.jpg";
import peruImg from "../assets/img2.jpg";

const tripsData = {
  "Recently viewed": [
    {
      id: 1,
      title: "Serene Bali Retreat",
      description: "10 days of cultural immersion and relaxation in Indonesia’s paradise",
      duration: "10 days",
      originalPrice: "$2,500",
      discountedPrice: "$2,899",
      image: baliImg,
      signature: true,
    },
    {
      id: 2,
      title: "Paris Getaway",
      description: "Explore the romantic city of lights with art and cuisine",
      duration: "7 days",
      originalPrice: "$3,500",
      discountedPrice: "$3,200",
      image: parisImg,
      signature: false,
    },
    {
      id: 3,
      title: "Tokyo Experience",
      description: "Discover the blend of tradition and modern life in Japan",
      duration: "8 days",
      originalPrice: "$3,800",
      discountedPrice: "$3,500",
      image: tokyoImg,
      signature: false,
    },
    {
      id: 4,
      title: "Peruvian Highlights",
      description: "Discover Machu Picchu, Sacred Valley and vibrant Lima",
      duration: "11 days",
      originalPrice: "$3,300",
      discountedPrice: "$2,999",
      image: peruImg,
      signature: false,
    },
  ],

  "New trips": [
    {
      id: 5,
      title: "Maldives Escape",
      description: "Relax on stunning beaches with crystal clear waters",
      duration: "6 days",
      originalPrice: "$4,200",
      discountedPrice: "$4,000",
      image: maldivesImg,
      signature: false,
    },
    {
      id: 6,
      title: "Iceland Adventure",
      description: "Experience glaciers, geysers, and northern lights",
      duration: "9 days",
      originalPrice: "$4,800",
      discountedPrice: "$4,500",
      image: icelandImg,
      signature: false,
    },
    {
      id: 7,
      title: "New York Highlights",
      description: "Explore the iconic sights of the Big Apple",
      duration: "5 days",
      originalPrice: "$2,500",
      discountedPrice: "$2,300",
      image: newyorkImg,
      signature: false,
    },
  ],

  "Popular Trips": [
    {
      id: 8,
      title: "Maldives Escape",
      description: "Relax on stunning beaches with crystal clear waters",
      duration: "6 days",
      originalPrice: "$4,200",
      discountedPrice: "$4,000",
      image: maldivesImg,
      signature: false,
    },
    {
      id: 9,
      title: "Paris Getaway",
      description: "Explore the romantic city of lights with art and cuisine",
      duration: "7 days",
      originalPrice: "$3,500",
      discountedPrice: "$3,200",
      image: parisImg,
      signature: false,
    },
    {
      id: 10,
      title: "Tokyo Experience",
      description: "Discover the blend of tradition and modern life in Japan",
      duration: "8 days",
      originalPrice: "$3,800",
      discountedPrice: "$3,500",
      image: tokyoImg,
      signature: false,
    },
  ],
};

export default tripsData;
