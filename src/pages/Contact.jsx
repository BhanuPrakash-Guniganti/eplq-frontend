import React from "react";
import { useNavigate } from "react-router-dom";

function Contact() {
    const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">
        <header className="card-header">
          <h2 className="card-title">Contact Us</h2>
          <p className="card-subtitle">
            Have feedback, feature ideas, or issues while using EPLQ – POI
            Finder? Reach out using the details below.
          </p>
        </header>


        <section className="about-section">
          <h3 className="section-title">Support</h3>
          <p className="body-text">
            <strong>Email:</strong>{" "}
            <a href="mailto:support.eplqpoifinder@gmail.com">
              support.eplqpoifinder@gmail.com
            </a>
            <br />
            <strong>Location:</strong> Hyderabad, Telangana, India
          </p>
        </section>

        <section className="about-section">
          <h3 className="section-title">Availability</h3>
          <p className="body-text">
            Monday – Saturday: 9:00 AM – 6:00 PM
            <br />
            Sunday: Closed
          </p>
        </section>

        <section className="about-section">
          <h3 className="section-title">Connect with the developer</h3>
          <p className="body-text">
            This project was designed and developed by{" "}
            <a
              href="https://your-portfolio-link.com"
              target="_blank"
              rel="noreferrer"
            >
              Bhanu Prakash Guniganti
            </a>{" "}
            as part of a full‑stack internship project.
          </p>
          <ul className="bullet-list">
            <li>
              Portfolio:{" "}
              <a
                href="https://your-portfolio-link.com"
                target="_blank"
                rel="noreferrer"
              >
                your-portfolio-link.com
              </a>
            </li>
            <li>
              LinkedIn:{" "}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a href="https://github.com" target="_blank" rel="noreferrer">
                github.com
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Contact;
