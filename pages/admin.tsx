// pages/admin.tsx
import React, { useState, useEffect } from 'react' // Import useState and useEffect
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { validCredentials, DEFAULT_REDIRECT_URL } from 'lib/users'

// Define a type for the data we'll put in the table
type UserTableEntry = {
  username: string;
  password: string;
  redirect: string;
}

// --- NEW PIN PAD COMPONENT ---
type PinPadProps = {
  title: string;
  pinLength: number;
  pin: string;
  setPin: (pin: string) => void;
  onPinComplete: (pin: string) => void;
};

const PinPad: React.FC<PinPadProps> = ({ title, pinLength, pin, setPin, onPinComplete }) => {
  // Effect to check for pin completion
  useEffect(() => {
    if (pin.length === pinLength) {
      onPinComplete(pin);
    }
  }, [pin, pinLength, onPinComplete]);

  const handleNumClick = (num: string) => {
    if (pin.length < pinLength) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  // Create an array for the dots
  const dots = [];
  for (let i = 0; i < pinLength; i++) {
    dots.push(<div key={i} className={`dot ${i < pin.length ? 'filled' : ''}`}></div>);
  }

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'utility', '0', 'delete'
  ];

  return (
    <div className="pin-pad-container">
      <h3 className="pin-title">{title}</h3>
      <div className="pin-dots">{dots}</div>
      <div className="pin-grid">
        {buttons.map((btn) => {
          if (btn === 'utility') {
            return <div key="utility" className="pin-btn-placeholder" />; // Placeholder for layout
          }
          if (btn === 'delete') {
            return <button key="delete" type="button" className="pin-btn utility" onClick={handleDelete}>&larr;</button>;
          }
          return <button key={btn} type="button" className="pin-btn" onClick={() => handleNumClick(btn)}>{btn}</button>;
        })}
      </div>
    </div>
  );
};
// --- END PIN PAD COMPONENT ---


// Update the component's props to accept the new 'allUsers' list
export default function AdminPage({ user, usernames, allUsers }: { 
  user: SessionData, 
  usernames: string[], 
  allUsers: UserTableEntry[] 
}) {
  const [impersonateError, setImpersonateError] = useState('')
  
  // --- State for Modal and Table ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [modalPassword, setModalPassword] = useState('') // This will now store the PIN
  const [modalError, setModalError] = useState('')
  const ADMIN_PASSWORD = '8007' // The password to unlock the table
  
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

  // --- New Handler for PIN Completion ---
  const handlePinComplete = (pin: string) => {
    if (pin === ADMIN_PASSWORD) {
      setIsUnlocked(true) // Unlock the table
      setIsModalOpen(false) // Close the modal
      setModalPassword('')
      setModalError('')
    } else {
      setModalError('Wrong PIN. Try again.')
      // Reset the PIN after a short delay so the user sees the error
      setTimeout(() => {
        setModalPassword('')
        setModalError('')
      }, 1000);
    }
  }

  return (
    <div>
      {/* Styles for the page, form, table, and NEW MODAL/PINPAD */}
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
        
        /* --- MODAL STYLES --- */
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
        
        /* --- NEW PIN PAD STYLES --- */
        .pin-pad-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .pin-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .pin-dots {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid #333;
          margin: 0 8px;
        }
        .dot.filled {
          background-color: #333;
        }
        .pin-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          width: 100%;
          max-width: 240px; /* Controls the max size of the pad */
        }
        .pin-btn {
          width: 60px; /* Fixed size for circle */
          height: 60px; /* Fixed size for circle */
          font-size: 24px;
          border-radius: 50%; /* Makes it round */
          border: 1px solid #ccc;
          background-color: #f0f0f0;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background-color 0.2s;
        }
        .pin-btn:hover {
          background-color: #e0e0e0;
        }
        .pin-btn.utility {
          font-size: 20px;
          background-color: transparent;
          border: none;
        }
        .pin-btn.utility:hover {
          background-color: #f0f0f0;
        }
        .pin-btn-placeholder {
          width: 60px;
          height: 60px;
        }
        /* --- END NEW STYLES --- */
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
        
        {/* --- UPDATED PASSWORD MODAL --- */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => {
            setIsModalOpen(false);
            setModalError('');
            setModalPassword('');
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => {
                setIsModalOpen(false);
                setModalError('');
                setModalPassword('');
              }}>&times;</button>
              
              {/* This now uses the PinPad component */}
              <PinPad
                title="Enter Admin PIN"
                pinLength={ADMIN_PASSWORD.length}
                pin={modalPassword}
                setPin={setModalPassword}
                onPinComplete={handlePinComplete}
              />
              {modalError && <p className="error" style={{ marginTop: '15px' }}>{modalError}</p>}

            </div>
          </div>
        )}
        {/* --- END NEW MODAL --- */}
        
      </div>
    </div>
  )
}

// --- SERVER SIDE PROPS (No changes) ---
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
