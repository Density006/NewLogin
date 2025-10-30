// pages/reset-password.tsx
import React from 'react';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const router = useRouter();
  // The Google Form URL, with "&embedded=true" to look cleaner
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfQI4BOVXkA_rOZzkAgVggAZdQblOB7Li0DpK1FhHL3bJHulA/viewform?usp=publish-editor&embedded=true";

  return (
    <>
      <style jsx global>{`
        body {
          font-family: Calibri, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .reset-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .return-btn {
          width: 100%;
          max-width: 400px;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .return-btn:hover {
          background-color: #005bb5;
        }
        .iframe-container {
          width: 100%;
          max-width: 800px;
          height: 80vh; /* 80% of the viewport height */
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }
        .iframe-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
      
      <div className="reset-container">
        <h1 style={{ textAlign: 'center' }}>Password Reset</h1>
        <p style={{ textAlign: 'center' }}>Please fill out the form below to request a password reset.</p>
        <button className="return-btn" onClick={() => router.push('/login')}>
          Return to Login
        </button>
        <div className="iframe-container">
          <iframe 
            src={googleFormUrl}
            title="Password Reset Form"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </>
  );
}
