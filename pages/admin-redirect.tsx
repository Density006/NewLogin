// pages/admin-redirect.tsx
import React from 'react';
import { useRouter } from 'next/router';

export default function AdminRedirectPage() {
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
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 30px;
          align-items: center;
        }
        .submit-btn, .secondary-btn {
          width: 100%;
          max-width: 400px;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .submit-btn {
          background-color: #0070f3;
          color: white;
        }
        .submit-btn:hover {
          background-color: #005bb5;
        }
        .secondary-btn {
          background-color: #e0e0e0;
          color: black;
        }
        .secondary-btn:hover {
          background-color: #c7c7c7;
        }
      `}</style>
      
      <div className="container">
        <h1>Admin Access</h1>
        <p>Do you want to stay on the login page or go to the admin panel?</p>
        
        <div className="button-group">
          <button className="submit-btn" onClick={() => router.push('/admin')}>
            Go to Admin Page
          </button>
          <button className="secondary-btn" onClick={() => router.push('/login')}>
            Stay on Login
          </button>
        </div>
      </div>
    </>
  );
}
