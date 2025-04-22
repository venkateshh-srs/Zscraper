import { useState, useEffect } from "react";
import JobCard from "./JobCard";
import Login from "./Login";
import Logout from "./Logout";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";

const JobList = () => {
  console.log("Gotcha to joblist");

  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const jobPosts = location.state?.jobDetails || [];
  useEffect(() => {
    if (!location.state?.jobDetails) {
      console.log("No job details....navigating to login page:{ ");

      navigate("/");
    }
  }, []);

  const handleSend = async () => {
    if (selectedJob) {
      const url = jobPosts[selectedJob - 1].href;
      const jobId = url.match(/jobs\/(\d+)\//)[1];
      setLoading(true);
      console.log(jobId);

      setStatus("Started scraping...");

      const eventSource = new EventSource(
        `http://localhost:1235/scrape-job?jobId=${jobId}`
      );

      let applicantList = [];

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.status) {
          setStatus(data.status);
        }

        if (data.applicants) {
          applicantList = data.applicants;
        }

        if (data.completed) {
          eventSource.close();
          // setLoading(false);
          navigate("/jobs/applicants", { state: { applicantList } });
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        setLoading(false);
        setStatus("Error occurred while scraping.");
      };
    }
  };

  return (
    <>
      <div>
        <Logout></Logout>
      </div>
      <div className="container">
        {jobPosts.length === 0 ? (
          <h4>Sorry! Looks like you haven't posted any jobs :{"{"}</h4>
        ) : !loading ? (
          <div>
            <div className="job-list">
              {jobPosts.map((job, jobInd) => (
                <JobCard
                  selectedJob={selectedJob}
                  setSelectedJob={setSelectedJob}
                  job={job}
                  jobInd={jobInd}
                  key={jobInd}
                />
              ))}
            </div>
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!selectedJob}
              className="send-button"
            >
              Send
            </button>
          </div>
        ) : (
          <div className="login-loader">
            <div className="loader"></div>
            <p className="animated-text">{status}</p>
          </div>
        )}
      </div>
    </>
  );
};
export default JobList;
