import React from "react";
import { useNavigate } from "react-router-dom";

function About() {
    const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">
        <header className="card-header">
          <h2 className="card-title">About EPLQ – POI Finder</h2>
          <p className="card-subtitle">
            EPLQ – POI Finder is a location-based web application that helps
            users discover nearby Points of Interest (POIs) such as restaurants,
            hospitals, schools, shopping areas, and more within a selected
            radius.
          </p>
        </header>



        <section className="about-section">
          <h3 className="section-title">What you can do</h3>
          <ul className="bullet-list">
            <li>Search nearby POIs using latitude, longitude, and radius.</li>
            <li>Filter places by category (hospital, restaurant, shopping, etc.).</li>
            <li>See distance information for each POI.</li>
            <li>Save important locations to favourites for quick access.</li>
            <li>Use a clean, simple and responsive interface.</li>
            <li>Sign in securely so your data stays personalised.</li>
          </ul>
        </section>

        <section className="about-section">
          <h3 className="section-title">Why this project?</h3>
          <p className="body-text">
            Modern location-based services are powerful, but they also raise
            questions around privacy, unnecessary tracking, and collecting more
            user data than is needed. EPLQ – POI Finder explores how users can
            still enjoy accurate POI search while keeping the system efficient
            and respectful of user privacy.
          </p>
        </section>

        <section className="about-section">
          <h3 className="section-title">Technologies used</h3>
          <ul className="bullet-list">
            <li>Frontend: React.js, CSS.</li>
            <li>Backend: Node.js, Express.js.</li>
            <li>Database: MongoDB.</li>
            <li>Maps and location: POI/location search APIs with map view.</li>
            <li>Authentication: JWT‑based secure login.</li>
          </ul>
        </section>

        <section className="about-section">
          <h3 className="section-title">Project author</h3>
          <p className="body-text">
            I’m{" "}
            <a
              href="https://your-portfolio-link.com"
              target="_blank"
              rel="noreferrer"
            >
              Bhanu Prakash Guniganti
            </a>
            . I built EPLQ – POI Finder as the final project of my full‑stack
            intern journey, focusing on creating a professional MERN
            application with a strong emphasis on privacy‑aware location search.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
