import express from "express";
import cors from "cors";
import fs from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";

import mongoose from "mongoose";

import parsedApplicants from "./utils/applicantParser.js";
import Applicant from "./models/ApplicantModel.js";

dotenv.config();
const dbString = process.env.DB_URL;
console.log(process.env);

console.log(dbString);

mongoose.connect(dbString);
mongoose.connection.on("connected", () => {
  console.log("connected to mongodb atlas");
});

// console.log(cookies);

puppeteer.use(StealthPlugin());
let browser = null;
let page = null;
let cookies = null;
dotenv.config();
const port = 1235;
const app = express();
app.use(cors());
app.use(express.json());

const getJobs = async () => {
  browser = await puppeteer.launch({
    headless: true,
  });

  page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
  );
  //  still woking :}
  // In your getJobs function, modify the setCookie call
  await page.setCookie(...cookies);
  await page.goto("https://www.linkedin.com/feed/", {
    waitUntil: "domcontentloaded",
  });
  try {
    console.log("going....");

    await page.goto("https://www.linkedin.com/my-items/posted-jobs/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
  } catch (error) {
    // await page.goto(url, { waitUntil: "networkidle2" }, { timeout: 20000 });

    console.log("Error here");

    console.log(error);
  }

  await page.waitForSelector(".workflow-results-container", {
    timeout: 10000,
  });

  // Extract text from <ul> inside .workflow-results-container
  const jobDetails = await page.evaluate(() => {
    const results = [];
    const containers = document.querySelectorAll(
      ".workflow-results-container ul"
    );

    // const links = document.querySelectorAll(
    //   ".workflow-results-container ul li"
    // );
    // console.log(links);

    containers.forEach((ul) => {
      const text = Array.from(ul.querySelectorAll("li")).map((li) => {
        const anchor = li.querySelector("a");
        return {
          text: li.innerText.trim(),
          href: anchor ? anchor.href : "No link",
        };
      });

      console.log(text);
      results.push(text);
    });

    //assuming only 2 ul's and the first one is irrelevant to job details
    results.shift();
    console.log(results[0]);

    return results[0];
  });

  console.log("Extracted Job Details:", jobDetails);
  // jobDetails structure
  // [
  //  [
  //    ul
  //       li
  //       li
  //       li
  //    ul
  //  ],
  //     [
  //    ul
  //       li
  //       li
  //       li
  //    ul
  //  ],

  // ]

  return jobDetails;
};
app.get("/applicant-data", (req, res) => {});
app.post("/save-cookies", (req, res) => {
  cookies = req.body.cookies;
  console.log("cookies hitted");
  console.log(cookies);

  res.status(200).json({ success: true });
});

app.get("/create-login", async (req, res) => {
  console.log("Create login page req");

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--window-size=800,600"],
      defaultViewport: {
        width: 800,
        height: 600,
      },
    });
    page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
    );
    await page.goto("https://www.linkedin.com/login", {
      waitUntil: "domcontentloaded",
    });

    const checkLogin = async () => {
      const currentURL = page.url();
      if (currentURL.includes("/feed")) {
        cookies = await page.cookies();
        // fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
        await browser.close();
        res.status(200).json({ success: true, message: "Login successful!" });
      } else {
        console.log("Polling for wether logged in");

        setTimeout(checkLogin, 1000);
      }
    };

    checkLogin();
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});
app.post("/get-jobs", async (req, res) => {
  console.log("Get jobs route hitted");
  let jobDetails = await getJobs();
  if (!jobDetails) {
    jobDetails = [];
  }
  res.status(200).json({ message: jobDetails });
});

app.get("/scrape-job", async (req, res) => {
  const jobId = req.query.jobId;
  console.log(jobId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  let start = 0;
  const globalResults = [];
  let needsReload = false;
  let startFrom = 0;
  let currentPageResults = [];

  while (true) {
    let url = `https://www.linkedin.com/hiring/jobs/${jobId}/applicants/?start=${start}`;
    console.log(`Navigating to: ${url}`);
    res.write(
      `data: ${JSON.stringify({
        status: `Loading page ${start / 25 + 1}...`,
      })}\n\n`
    );

    try {
      await page.goto(url, { waitUntil: "networkidle2" }, { timeout: 30000 });
    } catch (error) {
      // console.error("Error navigating to page:", error);
      // break;
      console.log("Didnt loaded error..");
    }

    const applicants = await page.$$("li.hiring-applicants__list-item");
    console.log(
      `Found ${applicants.length} applicants on page ${start / 25 + 1}`
    );
    res.write(
      `data: ${JSON.stringify({
        status: `Found ${applicants.length} applicants on page ${
          start / 25 + 1
        }`,
      })}\n\n`
    );

    if (applicants.length === 0) break;

    // Current page results - will be added to globalResults only if complete

    needsReload = false;

    for (let i = startFrom; i < applicants.length; i++) {
      try {
        console.log(`Fetching applicant ${start + i + 1}...`);
        // res.write(
        //   `data: ${JSON.stringify({
        //     status: `Fetching applicant ${start + i + 1}...`,
        //   })}\n\n`
        // );

        await applicants[i].click();
        await page.waitForSelector("#hiring-detail-root", {
          visible: true,
          timeout: 10000,
        });

        // Extract candidate ID from URL
        const currentUrl = await page.url();
        const candidateIdMatch = currentUrl.match(/applicants\/(\d+)\/detail/);
        const candidateId = candidateIdMatch ? candidateIdMatch[1] : null;

        const applicantDetails = await page.evaluate(() => {
          return (
            document.querySelector("#hiring-detail-root")?.innerText || "N/A"
          );
        });
        let name = applicantDetails.split("\n")[0];
        name = name.replace(/’s application/g, "").trim();
        res.write(
          `data: ${JSON.stringify({
            status: `Fetching ${name}'s details...`,
          })}\n\n`
        );
        // Wait for "More..."
        await page.waitForFunction(() => {
          return Array.from(document.querySelectorAll("span")).some(
            (span) => span.innerText.trim() === "More…"
          );
        });
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Click "More" button if exists
        await page.evaluate(() => {
          const moreButton = Array.from(document.querySelectorAll("span")).find(
            (span) => span.innerText.trim() === "More…"
          );
          if (moreButton) {
            // moreButton.scrollIntoView({ behavior: "smooth", block: "center" });
            moreButton.click();
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Wait for download link
        let resumeLink = "N/A";
        try {
          await page.waitForFunction(
            () => {
              return Array.from(document.querySelectorAll("a")).some((a) =>
                a.innerText.trim().toLowerCase().includes("download")
              );
            },
            { timeout: 6000 }
          );

          resumeLink = await page.evaluate(() => {
            const resumeAnchor = Array.from(
              document.querySelectorAll("a")
            ).find((a) =>
              a.innerText.trim().toLowerCase().includes("download")
            );
            return resumeAnchor ? resumeAnchor.href : "N/A";
          });
        } catch (error) {
          console.log("Applicant resume link is not loaded, will reload page");
          res.write(
            `data: ${JSON.stringify({
              status: `Applicant resume link is not loaded, will reload page`,
            })}\n\n`
          );

          needsReload = true;
          startFrom = i;
          break;
        }

        console.log("Resume Link found");

        // Get dropdown text if available
        let dropdownText = "N/A";
        try {
          await page.waitForSelector(".artdeco-dropdown__content-inner", {
            timeout: 8000,
          });
          dropdownText = await page.evaluate(() => {
            const dropdown = document.querySelector(
              ".artdeco-dropdown__content-inner"
            );
            return dropdown ? dropdown.innerText : null;
          });
        } catch (e) {
          console.log("Couldn't extract dropdown text");
          res.write(
            `data: ${JSON.stringify({
              status: `Couldn't extract user details, will reload page`,
            })}\n\n`
          );
          needsReload = true;
          startFrom = i;
          break;
        }

        currentPageResults.push({
          applicant: start + i + 1,
          details: applicantDetails,
          dropdownText,
          resumeLink,
          candidateId,
          jobId,
        });
      } catch (error) {
        console.error(`Error processing applicant: ${error.message}`);
        res.write(
          `data: ${JSON.stringify({
            error: `Error processing applicant ${start + i + 1}`,
          })}\n\n`
        );
      }
    }

    if (needsReload) {
      console.log(
        "Reloading current page due to some user detials didn't found"
      );
      continue;
    }

    // Only add to global results if we completed the page successfully
    globalResults.push(...currentPageResults);

    // console.log(applicantsData);
    const parsedApplicantss = parsedApplicants(currentPageResults);
    // console.log(parsedApplicantss);
    res.write(
      `data: ${JSON.stringify({
        status: `Sending details of ${currentPageResults.length} applicants to DB`,
      })}\n\n`
    );
    try {
      await Applicant.insertMany(parsedApplicantss, { ordered: false });
    } catch (e) {
      console.log("DB error");
      console.log(e.message);
    }

    startFrom = 0;
    currentPageResults = [];
    start += 25;
    // format the current page details and send it to db as a batch update before moving to next page
  }

  res.write(
    `data: ${JSON.stringify({
      completed: true,
      applicants: globalResults,
      message: "Scraping completed successfully",
    })}\n\n`
  );
  res.end();
});

export default app;
