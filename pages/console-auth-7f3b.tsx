// pages/console-auth-7f3b.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { validCredentials, DEFAULT_REDIRECT_URL } from 'lib/users'

// Define a type for the data we'll put in the table
type UserTableEntry = {
  username: string;
  password: string;
  redirect: string;
}

// --- PIN PAD COMPONENT ---
type PinPadProps = {
  title: string;
  pinLength: number;
  pin: string;
  setPin: (pin: string) => void;
  onPinComplete: (pin: string) => void;
  error: string; // Pass error to display
};

const PinPad: React.FC<PinPadProps> = ({ title, pinLength, pin, setPin, onPinComplete, error }) => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for keyboard focus
  
  // Effect to check for pin completion
  useEffect(() => {
    if (pin.length === pinLength) {
      onPinComplete(pin);
    }
  }, [pin, pinLength, onPinComplete]);

  // Effect to auto-focus the container for keyboard input when it appears
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleNumClick = (num: string) => {
    if (pin.length < pinLength) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleDelete();
    }
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleNumClick(e.key);
    }
  };

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
    <div
      ref={containerRef}
      className="pin-pad-container"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      <h3 className="pin-title">{title}</h3>
      <div className="pin-dots">{dots}</div>
      <div className="pin-grid">
        {buttons.map((btn) => {
          if (btn === 'utility') {
            return <div key="utility" className="pin-btn-placeholder" />;
          }
          if (btn === 'delete') {
            return <button key="delete" type="button" className="pin-btn utility" onClick={handleDelete}>&larr;</button>;
          }
          return <button key={btn} type="button" className="pin-btn" onClick={() => handleNumClick(btn)}>{btn}</button>;
        })}
      </div>
      {error && <p className="error" style={{ marginTop: '15px' }}>{error}</p>}
    </div>
  );
};
// --- END PIN PAD COMPONENT ---


// --- MAIN ADMIN PAGE COMPONENT ---
export default function AdminPage({ user, usernames, allUsers }: { 
  user: SessionData, 
  usernames: string[], 
  allUsers: UserTableEntry[] 
}) {
  const router = useRouter()
  const [impersonateError, setImpersonateError] = useState('')
  
  // --- State for inline credentials ---
  const [viewState, setViewState] = useState<'hidden' | 'pinpad' | 'unlocked'>('hidden');
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [isAnimating, setIsAnimating] = useState(false) // For animation state
  const ADMIN_PASSWORD = '8007'
  
  const [isResetDropdownOpen, setIsResetDropdownOpen] = useState(false);
  const resetSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5tOhfvFBupEdGJavihf80w4AGpKw3PFuBmyH8u67kYNGIuGYiDZLpz7ZLni_vWU1RBucgPYKJN5PO/pubhtml?gid=456067184&single=true&widget=true&headers=false";

  
  async function handleImpersonateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setImpersonateError('')

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
        window.location.href = redirectUrl;
      } else {
        const { message } = await res.json()
        setImpersonateError(message)
      }
    } catch (error) {
      setImpersonateError('An unknown error occurred')
    }
  }

  // --- Handler for PIN Completion (with animation) ---
  const handlePinComplete = (completedPin: string) => {
    if (completedPin === ADMIN_PASSWORD) {
      setPinError('')
      setIsAnimating(true) // Start the cross-fade animation
      
      // Wait for animation to finish, then set final state
      setTimeout(() => {
        setViewState('unlocked');
        setIsAnimating(false);
        setPin(''); // Reset PIN
      }, 500); // This duration must match the CSS animation
      
    } else {
      setPinError('Wrong PIN. Try again.')
      setTimeout(() => {
        setPin('')
        setPinError('')
      }, 1000);
    }
  }
  
  // --- Handlers for showing/hiding credentials ---
  const handleShowPinPad = () => {
    setViewState('pinpad');
  }

  const handleHideCredentials = () => {
    setViewState('hidden');
    setPin('');
    setPinError('');
  }


  return (
    <div>
      <style jsx global>{`
        /* --- Keyframe Animations --- */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      
        body {
          font-family: Calibri, sans-serif;
        }
        .container {
          max-width: 800px;
          margin: 20px auto;
          padding: 0 10px;
        }
        .login-form {
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
        
        .submit-btn.secondary {
          background-color: #e0e0e0;
          color: black;
          margin-top: 15px;
        }
        .submit-btn.secondary:hover {
          background-color: #c7c7c7;
        }
        
        .error {
          color: red;
          margin-top: 10px;
        }
        
        .return-btn {
          padding: 8px 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;
        }
        .return-btn:hover {
          background-color: #005bb5;
        }
        
        .user-table {
          width: 100%;
          /* margin-top: 40px; <-- Removed, now part of container */
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
        
        /* --- PIN PAD STYLES --- */
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
          max-width: 240px;
        }
        .pin-btn {
          width: 60px;
          height: 60px;
          font-size: 24px;
          border-radius: 50%;
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
        
        /* --- NEW: CREDENTIALS WRAPPER --- */
        .credentials-section {
          margin-top: 40px;
        }
        
        .credentials-wrapper {
          position: relative; /* Container for absolute positioning */
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
          overflow: hidden; /* Hide anything that pokes out */
        }
        
        /* --- NEW: Animation/Visibility classes --- */
        .pinpad-view, .table-view {
          transition: opacity 0.5s ease-in-out;
        }
        
        .pinpad-view.fading-out {
          opacity: 0;
        }
        .table-view.fading-in {
          opacity: 1;
        }
        
        .table-view {
          opacity: 0; /* Hidden by default */
          position: absolute;
          top: 20px; /* Match padding */
          left: 20px; /* Match padding */
          right: 20px; /* Match padding */
        }
        
        .table-view.visible {
          opacity: 1;
          position: relative; /* Back to normal flow */
          top: 0;
          left: 0;
          right: 0;
          animation: fadeIn 0.5s;
        }
        
        /* --- COLLAPSIBLE DROPDOWN STYLES --- */
        .collapsible-container {
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 40px; /* Give space from credentials */
        }
        .collapsible-toggle {
          background-color: #f2f2f2;
          border: none;
          width: 100%;
          padding: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .collapsible-toggle:hover {
          background-color: #e8e8e8;
        }
        .arrow {
          font-size: 20px;
          transition: transform 0.3s ease-out;
          margin-right: 10px;
        }
        .arrow.open {
          transform: rotate(90deg);
        }
        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease-out;
        }
        .collapsible-content.open {
          max-height: 80vh;
          border-top: 1px solid #ccc;
        }
        .iframe-container {
          width: 100%;
          height: 80vh;
          border: 0;
        }
        .iframe-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
      
      <div className="container">
      
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1 style={{ margin: 0, paddingBottom: '20px' }}>Admin Panel</h1>
          <button className="return-btn" onClick={() => router.push('/login')}>
            Return to Login
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Welcome, {user.username}!</h2>
        
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

        {/* --- NEW: Credentials Section --- */}
        <div className="credentials-section">
          
          {/* STATE 1: Show Button */}
          {viewState === 'hidden' && (
            <button className="submit-btn" onClick={handleShowPinPad}>
              View User Credentials
            </button>
          )}

          {/* STATE 2: Show PinPad */}
          {viewState === 'pinpad' && (
            <div className={`credentials-wrapper ${isAnimating ? 'fading-out' : ''}`}>
              <div className={`pinpad-view ${isAnimating ? 'fading-out' : ''}`}>
                <PinPad
                  title="Enter Admin PIN"
                  pinLength={ADMIN_PASSWORD.length}
                  pin={pin}
                  setPin={setPin}
                  onPinComplete={handlePinComplete}
                  error={pinError}
                />
              </div>
              
              {/* This is hidden but present for the cross-fade */}
              <div className={`table-view ${isAnimating ? 'fading-in' : ''}`}>
                <h2 style={{ textAlign: 'center', marginTop: 0 }}>All User Credentials</h2>
                <table className="user-table">
                  {/* ... table content ... */}
                </table>
              </div>
            </div>
          )}
          
          {/* STATE 3: Show Credentials Table */}
          {viewState === 'unlocked' && (
             <div className="credentials-wrapper">
                <div className="table-view visible">
                  <h2 style={{ textAlign: 'center', marginTop: 0 }}>All User Credentials</h2>
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
                  
                  <button 
                    className="submit-btn secondary" 
                    onClick={handleHideCredentials}
                  >
                    Hide Credentials
                  </button>
                </div>
            </div>
          )}
          
        </div>
        
        {/* --- COLLAPSIBLE DROPDOWN --- */}
        <div className="collapsible-container">
          <button 
            className="collapsible-toggle" 
            onClick={() => setIsResetDropdownOpen(!isResetDropdownOpen)}
          >
            View password reset requests
            <span className={`arrow ${isResetDropdownOpen ? 'open' : ''}`}>&gt;</span>
          </button>
          <div className={`collapsible-content ${isResetDropdownOpen ? 'open' : ''}`}>
            <div className="iframe-container">
              <iframe 
                src={resetSheetUrl}
                title="Password Reset Responses"
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>
        
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
