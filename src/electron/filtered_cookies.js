const cookies = await loginWindow.webContents.session.cookies.get({});

const requiredCookieNames = ["li_at", "JSESSIONID", "li_rm", "lidc", "bcookie"];

const filteredCookies = cookies
  .filter((cookie) => requiredCookieNames.includes(cookie.name))
  .map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expirationDate,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite, // optional, uncomment if needed
  }));

loginWindow.close();
resolve(filteredCookies);
