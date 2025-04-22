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

// 📌 Handle LinkedIn login in embedded Electron browser
ipcMain.handle("open-login-window", async () => {
  return new Promise(async (resolve) => {
    const loginSession = session.fromPartition("persist:linkedin-login");

    loginWindow = new BrowserWindow({
      width: 900,
      height: 700,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webviewTag: true,
        partition: "persist:linkedin-login",
      },
    });
    await loginSession.clearStorageData();

    await loginWindow.loadURL("https://www.linkedin.com/login");

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
          sameSite: cookie.sameSite,
        }));

        loginWindow.close();
        resolve(formattedCookies);
      } else {
        console.log("Cheking if logged in...");

        setTimeout(checkLogin, 1000);
      }
    };

    checkLogin();
  });
});
