// pages/admin.tsx
import React, { useState } from 'react' // Import useState
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
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
  const [impersonateError, setImpersonateError] = useState('')
  
  // --- New State for Modal and Table ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [modalPassword, setModalPassword] = useState('')
  const [modalError, setModalError] = useState('')
  const ADMIN_PASSWORD = '8007' // The password to unlock the table
  // --- End New State ---
  
  // This function handles the dropdown form
  async function handleImpersonateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setImpersonateError('') // Clear old errors

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
        window.location.href = redirectUrl;
      } else {
        const { message } = await res.json()
        setImpersonateError(message)
      }
    } catch (error) {
      setImpersonateError('An unknown error occurred')
    }
  }

  // --- New Handler for the Modal Password ---
  const handleModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (modalPassword === ADMIN_PASSWORD) {
      setIsUnlocked(true) // Unlock the table
      setIsModalOpen(false) // Close the modal
      setModalPassword('')
      setModalError('')
    } else {
      setModalError('Wrong password. Please try again.')
      setModalPassword('')
    }
  }

  return (
    <div>
      {/* Styles for the page, form, table, and NEW MODAL */}
      <style jsx global>{`
        body {
          font-family: Calibri, sans-serif;
        }
        .container {
          max-width: 800px;
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
        .user-table td:nth-child(3) {
          word-break: break-all;
        }
        
        /* --- NEW MODAL STYLES --- */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: white;
          padding: 20px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          width: 300px;
          text-align: center;
        }
        .modal-close-btn {
          position: absolute;
          top: 5px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #888;
        }
        .modal-form label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .modal-form input {
          width: 100%;
          padding: 8px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 15px;
          text-align: center;
        }
        .modal-form .submit-btn {
          width: 100%;
        }
        /* --- END NEW MODAL STYLES --- */
      `}</style>
      
      <div className="container">
        <h1 style={{ textAlign: 'center' }}>Admin Panel</h1>
        <h2 style={{ textAlign: 'center' }}>Welcome, {user.username}!</h2>
        
        {/* --- Impersonation Form --- */}
        <form className="login-form" onSubmit={handleImpersonateSubmit}>
          <div className="form-group">
            <label htmlFor="username">Select user to login as:</label>
            <select id="username" name="username" required defaultValue="">
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
          {impersonateError && <p className="error">{impersonateError}</p>}
        </form>

        {/* --- This section is now conditional --- */}
        {isUnlocked ? (
          // --- USER TABLE (Visible only if unlocked) ---
          <>
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
          </>
        ) : (
          // --- VIEW CREDENTIALS BUTTON (Visible only if locked) ---
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="submit-btn" style={{ maxWidth: '400px' }} onClick={() => setIsModalOpen(true)}>
              View User Credentials
            </button>
          </div>
        )}
        
        {/* --- NEW PASSWORD MODAL --- */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
              
              <form className="modal-form" onSubmit={handleModalSubmit}>
                <label htmlFor="modal-password">Enter Admin Password</label>
                <input
                  id="modal-password"
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  autoFocus
                />
                <button className="submit-btn" type="submit">Unlock</button>
                {modalError && <p className="error">{modalError}</p>}
              </form>
            </div>
          </div>
        )}
        {/* --- END NEW MODAL --- */}
        
      </div>
    </div>
  )
}

// --- SERVER SIDE PROPS (No changes needed here) ---
export const getServerSideProps = withIronSessionSsr(
  async function ({ req, res }) {
    const user = req.session.user

    if (user === undefined || user.isAdmin !== true) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: { isLoggedIn: false, username: '', redirectUrl: '', isAdmin: false } as SessionData,
          usernames: [],
          allUsers: [],
        },
      }
    }
    
    const allUsers = Array.from(validCredentials.entries()).map(([username, data]) => ({
      username: username,
      password: data.pwd,
      redirect: data.redirect || DEFAULT_REDIRECT_URL
    }));

    const usernames = allUsers.map(u => u.username);

    return {
      props: { 
        user: req.session.user,
        usernames: usernames,
        allUsers: allUsers,
      },
    }
  },
  sessionOptions
)
