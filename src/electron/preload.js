const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startLinkedInLogin: () => ipcRenderer.invoke("start-linkedin-login"),
});
