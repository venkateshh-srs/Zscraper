import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import expressApp from "../server/index.js";

let mainWindow;
let loginWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
};

app.whenReady().then(() => {
  createWindow();

  // Start express backend
  expressApp.listen(1235, () => {
    console.log("Express server running on port 1235");
  });
});

// when a webview is created, add the following code to it (to bypass windows security popup)
app.on("web-contents-created", (e, wc) => {
  // before a webview makes a request
  wc.session.webRequest.onBeforeRequest((details, callback) => {
    // if the request url matches the url which appears to be sending the passkey request
    if (details.url.includes("checkpoint/pk/initiateLogin")) {
      // log the blocked url
      // console.log("\x1b[31m", "Blocked", details.url);
    } else {
      // if the request url doesn't match the misbehaving url, allow the callback as usual
      callback({});
    }
  });
});

ipcMain.handle("open-login-window", async () => {
  return new Promise((resolve) => {
    loginWindow = new BrowserWindow({
      width: 900,
      height: 700,
      parent: mainWindow,
      // modal: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    loginWindow.loadURL("https://www.linkedin.com/login");

    const checkLogin = async () => {
      const currentURL = loginWindow.webContents.getURL();

      if (currentURL.includes("/feed")) {
        const cookies = await loginWindow.webContents.session.cookies.get({});
        const formattedCookies = cookies.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expirationDate,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
        }));

        loginWindow.close();
        resolve(formattedCookies);
      } else {
        console.log("Checking if logged in...");

        setTimeout(checkLogin, 1000);
      }
    };

    checkLogin();
  });
});
ipcMain.handle("logout", async () => {
  try {
    const ses = session.defaultSession;
    await ses.clearStorageData();
    return { success: true };
  } catch (err) {
    console.error("Error clearing session:", err);
    return { success: false };
  }
});
