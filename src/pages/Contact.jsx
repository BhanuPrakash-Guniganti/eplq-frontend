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
            <a href="mailto:connectwithguniganti@gmail.com">
              connectwithguniganti@gmail.com
            </a>
            <br />
            <strong>Location:</strong> Hyderabad, Telangana, India
          </p>
        </section>

        <section className="about-section">
          <h3 className="section-title">Availability</h3>
          <p className="body-text">
            I am available for full-time work. Feel free to reach out via email
            for any inquiries or opportunities.
          </p>
        </section>

        <section className="about-section">
          <h3 className="section-title">Connect with the developer</h3>
          <p className="body-text">
            This project was designed and developed by{" "}
            <a
              href="https://bhanuprakash-dev.netlify.app/"
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
                href="https://bhanuprakash-dev.netlify.app/"
                target="_blank"
                rel="noreferrer"
              >
                portfolio.com
              </a>
            </li>
            <li>
              LinkedIn:{" "}
              <a
                href="https://www.linkedin.com/in/bhanu-prakash-guniganti-405856295/"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a href="https://github.com/BhanuPrakash-Guniganti" target="_blank" rel="noreferrer">
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
