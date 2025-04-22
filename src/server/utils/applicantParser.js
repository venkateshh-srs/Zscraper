const extractDetails = (applicant) => {
  let name = applicant.details.split("\n")[0];

  name = name.replace(/’s application/g, "").trim();

  const dropdownLines = applicant.dropdownText.split("\n");
  const email = dropdownLines.length > 1 ? dropdownLines[2].trim() : "N/A";

  const phoneNumber =
    dropdownLines.length > 4 ? dropdownLines[5].trim() : "N/A";
  const resumeLink = applicant.resumeLink || "N/A";
  const jobId = applicant.jobId;
  const candidateId = applicant.candidateId;
  return { name, email, phoneNumber, resumeLink, jobId, candidateId };
};

const parsedApplicants = (applicantsData) => {
  return applicantsData.map((applicant) => {
    return extractDetails(applicant);
  });
};
export default parsedApplicants;
