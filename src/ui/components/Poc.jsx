import React from "react";

import puppeteer from "puppeteer";
(async () => {
  const wsEndpoint = await fetch("http://localhost:3000/start-session")
    .then((res) => res.json())
    .then((data) => data.wsEndpoint);

  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  const page = await browser.newPage();

  await page.goto("https://www.linkedin.com");
  console.log("User is logging in...");

  // Wait for user input (manual login)
  await new Promise((resolve) => setTimeout(resolve, 30000));

})();

function Poc() {
  return <div></div>;
}

export default Poc;
