import React from "react";
import "./Careers.css";

function Careers() {
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      location: "Hyderabad",
      type: "Full Time",
      experience: "1-3 Years",
    },
    {
      id: 2,
      title: "Backend Developer",
      location: "Bangalore",
      type: "Full Time",
      experience: "2-5 Years",
    },
    {
      id: 3,
      title: "UI/UX Designer",
      location: "Remote",
      type: "Full Time",
      experience: "1-4 Years",
    },
    {
      id: 4,
      title: "Digital Marketing Executive",
      location: "Delhi",
      type: "Full Time",
      experience: "1-2 Years",
    },
    {
      id: 5,
      title: "Customer Support Executive",
      location: "Noida",
      type: "Full Time",
      experience: "0-2 Years",
    },
    {
      id: 6,
      title: "Pharmacist",
      location: "Mumbai",
      type: "Full Time",
      experience: "2+ Years",
    },
  ];

  return (
    <div className="careers">

      <div className="career-banner">
        <h1>Careers at MEDIKART</h1>
        <p>
          Join our passionate team and help us build the future of
          healthcare.
        </p>
      </div>

      <section className="why-join">
        <h2>Why Join MEDIKART?</h2>

        <div className="benefits">

          <div className="benefit-card">
            <h3>💼 Career Growth</h3>
            <p>
              Learn new technologies and grow with experienced mentors.
            </p>
          </div>

          <div className="benefit-card">
            <h3>🏥 Health Benefits</h3>
            <p>
              Medical insurance and wellness programs for employees.
            </p>
          </div>

          <div className="benefit-card">
            <h3>💰 Competitive Salary</h3>
            <p>
              Attractive salary packages with performance bonuses.
            </p>
          </div>

          <div className="benefit-card">
            <h3>🌍 Flexible Work</h3>
            <p>
              Hybrid and remote work opportunities.
            </p>
          </div>

        </div>
      </section>

      <section className="jobs">

        <h2>Current Openings</h2>

        {jobs.map((job) => (
          <div className="job-card" key={job.id}>

            <div>
              <h3>{job.title}</h3>

              <p>
                📍 {job.location}
              </p>

              <p>
                💼 {job.type}
              </p>

              <p>
                ⭐ {job.experience}
              </p>
            </div>

            <button className="apply-btn">
              Apply Now
            </button>

          </div>
        ))}

      </section>

      <section className="career-contact">

        <h2>Didn't Find a Suitable Role?</h2>

        <p>
          Send your resume to:
        </p>

        <h3>careers@medikart.com</h3>

      </section>

    </div>
  );
}

export default Careers;