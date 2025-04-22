const JobCard = ({ setSelectedJob, selectedJob, job, jobInd }) => {
  return (
    <div
      className={`job-card ${selectedJob === jobInd + 1 ? "selected" : ""}`}
      onClick={() => {
        setSelectedJob(jobInd + 1);
        // console.log(jobInd);
      }}
    >
      {job.text.split("\n").map((line, lineIndex) => (
        <p key={lineIndex}>{line}</p>
      ))}
      <a href={job.href} target="_blank" rel="noopener noreferrer">
        View Job
      </a>
    </div>
  );
};
export default JobCard;
