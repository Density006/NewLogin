// pages/easter-egg.tsx
import React from 'react';
import { useRouter } from 'next/router';

export default function EasterEggPage() {
  const router = useRouter();

  return (
    <>
      <style jsx global>{`
        body {
          font-family: Calibri, sans-serif;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 80px auto;
          padding: 40px;
          text-align: center;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          background-color: #fff;
        }
        h1 {
          font-size: 28px;
        }
        p {
          font-size: 18px;
          color: #333;
          line-height: 1.6;
        }
        .submit-btn {
          width: 100%;
          max-width: 400px;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }
        .submit-btn:hover {
          background-color: #005bb5;
        }
        .egg-image {
          width: 150px;
          height: 150px;
          margin: 20px auto;
        }
      `}</style>
      
      <div className="container">
        {/* Simple SVG of an Easter Egg */}
        <svg className="egg-image" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 128C84.3164 128 100 102.049 100 64C100 25.9514 84.3164 0 50 0C15.6836 0 0 25.9514 0 64C0 102.049 15.6836 128 50 128Z" fill="#F0F8FF"/>
          <path d="M10 70C10 70 25.5 60 35 75C44.5 90 55.5 65 65 80C74.5 95 90 75 90 75" stroke="#4682B4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 8"/>
          <path d="M20 50C20 50 35.5 40 45 55C54.5 70 65.5 45 75 60C84.5 75 100 55 100 55" stroke="#B0C4DE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 6"/>
        </svg>
        
        <h1>Well done!</h1>
        <p>You found the easter egg page. Send me an email and I can give you some exclusive access.</p>
        
        <button className="submit-btn" onClick={() => router.push('/login')}>
          Return to Login
        </button>
      </div>
    </>
  );
}
