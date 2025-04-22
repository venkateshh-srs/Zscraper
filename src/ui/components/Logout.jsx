import React from "react";
import { useNavigate } from "react-router-dom";

const { ipcRenderer } = window.require("electron");

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await ipcRenderer.invoke("logout");

    if (result.success) {
      console.log("Sucessfully logged out");

      navigate("/");
    } else {
      alert("Failed to log out. Try again.");
    }
  };

  return (
    <button
      style={{
        padding: "8px 12px",
        // border: "1px solid red",
        position: "absolute",
        right: "13px",
        top: "5px",
      }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default Logout;
