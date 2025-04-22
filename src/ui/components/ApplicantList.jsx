import { useLocation, useNavigate } from "react-router";
import * as React from "react";
import { useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Logout from "./Logout";
const columns = [
  { id: "serial", label: "S. No", minWidth: 50 },
  { id: "name", label: "Name", minWidth: 200 },
  { id: "email", label: "Email", minWidth: 200 },
  { id: "phone", label: "Phone Number", minWidth: 150 },
  { id: "resume", label: "Resume", minWidth: 150 },
];

export default function ApplicantList() {
  const location = useLocation();
  const navigate = useNavigate();
  const applicantList = location.state?.applicantList || [];
  console.log(applicantList);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    if (!location.state?.applicantList) {
      console.log("No job details....navigating to login page");

      navigate("/");
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const extractDetails = (applicant) => {
    // Extract name (first line of 'details')
    let name = applicant.details.split("\n")[0];

    // Remove "’s application" (handling different types of apostrophes)
    name = name.replace(/’s application/g, "").trim();

    // Extract email (2nd line of 'dropdownText')
    const dropdownLines = applicant.dropdownText.split("\n");
    const email = dropdownLines.length > 1 ? dropdownLines[2].trim() : "N/A";

    // Extract phone number (5th line of 'dropdownText')
    const phoneNumber =
      dropdownLines.length > 4 ? dropdownLines[5].trim() : "N/A";
    const resumeLink = applicant.resumeLink || "N/A";

    return { name, email, phoneNumber, resumeLink };
  };

  const rows = applicantList.map((applicant, index) => {
    const { name, email, phoneNumber, resumeLink } = extractDetails(applicant);
    return {
      serial: index + 1,
      name,
      email,
      phone: phoneNumber,
      resume: resumeLink,
    };
  });

  return (
    <>
      <div>
        <Logout></Logout>
      </div>
      {applicantList.length ? (
        <Paper sx={{ width: "80%", overflow: "hidden", margin: "20px auto" }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader aria-label="applicants table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align="center"
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.serial}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id} align="center">
                          {column.id === "resume" ? (
                            row.resume !== "N/A" ? (
                              <a
                                href={row.resume}
                                download
                                style={{
                                  color: "blue",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  Download{" "}
                                  <ArrowDownwardIcon fontSize="small" />
                                </div>
                              </a>
                            ) : (
                              "No Resume"
                            )
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        <p> Redirected to login</p>
      )}
    </>
  );
}
