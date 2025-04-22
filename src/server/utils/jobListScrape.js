import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const getJobs = async (cookies) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
  );
  //  still woking :}
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
export default getJobs;
