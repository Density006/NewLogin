// pages/admin.tsx
import React, { useState } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
// Import the full map AND the default URL from our shared file
import { validCredentials, DEFAULT_REDIRECT_URL } from 'lib/users'

// Define a type for the data we'll put in the table
type UserTableEntry = {
  username: string;
  password: string;
  redirect: string;
}

// Update the component's props to accept the new 'allUsers' list
export default function AdminPage({ user, usernames, allUsers }: { 
  user: SessionData, 
  usernames: string[], 
  allUsers: UserTableEntry[] 
}) {
  const [errorMsg, setErrorMsg] = useState('')
  
  // This function handles the dropdown form
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('') // Clear old errors

    const body = {
      username: e.currentTarget.username.value, // This will be the selected value
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
      {/* Styles for the page, form, and the new table */}
      <style jsx global>{`
        body {
          font-family: Calibri, sans-serif;
        }
        .container {
          max-width: 800px; /* Make page a bit wider */
          margin: 20px auto;
          padding: 0 10px;
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
        .form-group input, .form-group select {
          width: 100%;
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
        
        /* --- NEW TABLE STYLES --- */
        .user-table {
          width: 100%;
          margin-top: 40px;
          border-collapse: collapse;
        }
        .user-table th, .user-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .user-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        /* Style to prevent long URLs from breaking the layout */
        .user-table td:nth-child(3) {
          word-break: break-all;
        }
        /* --- END NEW STYLES --- */

      `}</style>
      
      <div className="container">
        <h1 style={{ textAlign: 'center' }}>Admin Panel</h1>
        <h2 style={{ textAlign: 'center' }}>Welcome, {user.username}!</h2>
        
        {/* --- Impersonation Form --- */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Select user to login as:</label>
            <select id="username" name="username" required>
              <option value="" disabled>-- Please select a user --</option>
              {usernames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button className="submit-btn" type="submit">
            Verify and Login as User
          </button>
          {errorMsg && <p className="error">{errorMsg}</p>}
        </form>

        {/* --- NEW USER TABLE --- */}
        <h2 style={{ textAlign: 'center', marginTop: '40px' }}>All User Credentials</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Redirect URL</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.username}>
                <td>{u.username}</td>
                <td>{u.password}</td>
                <td>{u.redirect}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* --- END NEW TABLE --- */}
        
      </div>
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
          usernames: [],
          allUsers: [], // Pass empty array
        },
      }
    }
    
    // --- NEW DATA PASSING ---
    // Convert the Map to a serializable array for the table
    const allUsers = Array.from(validCredentials.entries()).map(([username, data]) => ({
      username: username,
      password: data.pwd,
      redirect: data.redirect || DEFAULT_REDIRECT_URL // Use default if one isn't set
    }));

    // Get just the names for the dropdown
    const usernames = allUsers.map(u => u.username);
    // --- END NEW DATA PASSING ---

    // Pass all user data to the page
    return {
      props: { 
        user: req.session.user,
        usernames: usernames, // For the dropdown
        allUsers: allUsers, // For the new table
      },
    }
  },
  sessionOptions
)
