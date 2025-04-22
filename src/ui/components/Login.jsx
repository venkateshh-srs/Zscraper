import React, { useState } from "react";
import { useNavigate } from "react-router";
import Logout from "./Logout";
const { ipcRenderer } = window.require("electron");

function Login() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(null);
  const navigate = useNavigate();

  const showLoginPage = async () => {
    setText(
      "Please login to your LinkedIn from the given login window to start fetching data"
    );

    try {
      const cookies = await ipcRenderer.invoke("open-login-window");

      // Send cookies to backend
      const response = await fetch("http://localhost:1235/save-cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies }),
      });

      const result = await response.json();
      if (result.success) {
        sendDetails();
      }
    } catch (error) {
      navigate("/");
    }
  };

  const sendDetails = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:1235/get-jobs", {
      method: "POST",
    });
    const jobDetails = await response.json();
    navigate("/jobs", { state: { jobDetails: jobDetails.message } });
  };

  return (
    <div className="container">
      {!loading ? (
        !text ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1>Securely login to your LinkedIn</h1>
            <button style={{ padding: "8px 12px" }} onClick={showLoginPage}>
              Login
            </button>
          </div>
        ) : (
          <h3>{text}</h3>
        )
      ) : (
        <div className="login-loader">
          <div className="loader"></div>
          <h3>Sucessfully logged-in into your LinkedIn</h3>
          <h4>Getting job details</h4>
        </div>
      )}
    </div>
  );
}

export default Login;
