// pages/admin.tsx
import React, { useState } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'

// This page is protected. It checks if the user is an admin.
export default function AdminPage({ user }: { user: SessionData }) {
  const [errorMsg, setErrorMsg] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('') // Clear old errors

    const body = {
      username: e.currentTarget.username.value,
    }

    try {
      const res = await fetch('/api/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 200) {
        const { redirectUrl } = await res.json()
        // On success, redirect to the impersonated user's page
        window.location.href = redirectUrl;
      } else {
        const { message } = await res.json()
        setErrorMsg(message)
      }
    } catch (error) {
      setErrorMsg('An unknown error occurred')
    }
  }

  return (
    <div>
      {/* Use the same global style from login.tsx to get the Calibri font */}
      <style jsx global>{`
        body {
          font-family: Calibri, sans-serif;
        }

        .login-form {
          max-width: 400px;
          margin: 40px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group input {
          width: 95%;
          padding: 8px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .submit-btn {
          width: 100%;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .submit-btn:hover {
          background-color: #005bb5;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
      `}</style>
      
      <h1 style={{ textAlign: 'center' }}>Admin Panel</h1>
      <h2 style={{ textAlign: 'center' }}>Welcome, {user.username}!</h2>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Enter username to login as:</label>
          <input id="username" name="username" type="text" required />
        </div>
        <button className="submit-btn" type="submit">
          Login as User
        </button>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  )
}

// This function runs on the server before the page is rendered
export const getServerSideProps = withIronSessionSsr(
  async function ({ req, res }) {
    const user = req.session.user

    // If no user is logged in, or if they are NOT an admin, redirect to login
    if (user === undefined || user.isAdmin !== true) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: { isLoggedIn: false, username: '', redirectUrl: '', isAdmin: false } as SessionData,
        },
      }
    }

    // If user is an admin, pass their info to the page
    return {
      props: { user: req.session.user },
    }
  },
  sessionOptions
)
