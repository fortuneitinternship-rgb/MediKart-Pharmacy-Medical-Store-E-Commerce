import React from "react";
import "./Blog.css";
import image1 from "../../assets/blog1.jpg";
import image2 from "../../assets/blog2.jpg";
import image3 from "../../assets/blog3.jpg";
import image4 from "../../assets/blog4.jpg";
import image5 from "../../assets/blog5.jpg";
import image6 from "../../assets/blog6.jpg";

const blogs = [
  {
    id: 1,
    title: "10 Tips to Boost Your Immunity Naturally",
    category: "Health Tips",
    date: "August 2, 2026",
    image: image1,
    description:
      "Discover simple daily habits and foods that can strengthen your immune system naturally.",
  },
  {
    id: 2,
    title: "How to Store Medicines Safely at Home",
    category: "Medicines",
    date: "July 28, 2026",
    image: image2,
    description:
      "Learn the best practices for storing medicines to maintain their effectiveness and safety.",
  },
  {
    id: 3,
    title: "Choosing the Right Vitamins for Your Body",
    category: "Vitamins",
    date: "July 20, 2026",
    image: image3,
    description:
      "A beginner's guide to selecting the right vitamins and supplements based on your health needs.",
  },
  {
    id: 4,
    title: "Benefits of Regular Health Checkups",
    category: "Healthcare",
    date: "July 15, 2026",
    image: image4,
    description:
      "Understand why routine health checkups are essential for preventing diseases and maintaining wellness.",
  },
  {
    id: 5,
    title: "Hair Care Tips for Healthy Hair",
    category: "Hair Care",
    date: "July 10, 2026",
    image: image5,
    description:
      "Easy hair care routines and products that keep your hair healthy, shiny, and strong.",
  },
  {
    id: 6,
    title: "Eye Care in the Digital Age",
    category: "Eye Care",
    date: "July 5, 2026",
    image: image6,
    description:
      "Protect your eyes from digital strain with these practical eye care tips.",
  },
];

function Blog() {
  return (
    <div className="blog-container">

      <div className="blog-header">
        <h1>MEDIKART Health Blog</h1>
        <p>
          Stay updated with the latest healthcare tips,
          wellness advice, and medical news.
        </p>
      </div>

      <div className="blog-grid">

        {blogs.map((blog) => (
          <div className="blog-card" key={blog.id}>

            <img
              src={blog.image}
              alt={blog.title}
            />

            <div className="blog-content">

              <span className="category">
                {blog.category}
              </span>

              <h2>{blog.title}</h2>

              <small>{blog.date}</small>

              <p>{blog.description}</p>

              <button>
                Read More
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default Blog;