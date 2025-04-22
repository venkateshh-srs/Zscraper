import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    index: true,
  },
  candidateId: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  resumeLink: {
    type: String,
  },
});
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Applicant = mongoose.model("Applicant", applicationSchema);
export default Applicant;
