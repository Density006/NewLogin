// pages/console-auth-7f3b.tsx
import React, { useState, useEffect, useRef } from 'react' // Import useRef
import { useRouter } from 'next/router' // <-- 1. IMPORTED ROUTER
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { validCredentials, DEFAULT_REDIRECT_URL } from 'lib/users'

// Define a type for the data we'll put in the table
type UserTableEntry = {
  username: string;
  password: string;
  redirect: string;
}

// --- UPDATED PIN PAD COMPONENT ---
type PinPadProps = {
  title: string;
  pinLength: number;
  pin: string;
  setPin: (pin: string) => void;
  onPinComplete: (pin: string) => void;
};

// --- Reverted to original PinPad component ---
const PinPad: React.FC<PinPadProps> = ({ title, pinLength, pin, setPin, onPinComplete }) => {
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

  // --- NEW: Keyboard Event Handler ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent default browser behavior for Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleDelete();
    }
    
    // Check if the key is a number
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleNumClick(e.key);
    }
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
    <div
      ref={containerRef}
      className="pin-pad-container"
      tabIndex={-1} // Makes the div focusable
      onKeyDown={handleKeyDown} // Add the keydown listener
      style={{ outline: 'none' }} // Hide the focus ring
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
  const router = useRouter() // <-- 3. INITIALIZED ROUTER
  const [impersonateError, setImpersonateError] = useState('')
  
  // --- State for Modal and Table ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [modalPassword, setModalPassword] = useState('') // This will now store the PIN
  const [modalError, setModalError] = useState('')
  const ADMIN_PASSWORD = '8007' // The password to unlock the table
  
  // --- State for collapsible dropdown ---
  const [isResetDropdownOpen, setIsResetDropdownOpen] = useState(false);
  
  // --- Updated Google Sheet URL ---
  const resetSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5tOhfvFBupEdGJavihf80w4AGpKw3PFuBmyH8u67kYNGIuGYiDZLpz7ZLni_vWU1RBucgPYKJN5PO/pubhtml?gid=456067184&single=true&widget=true&headers=false";

  
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

  // --- MODIFICATION: Removed all animation logic ---
  const handlePinComplete = (pin: string) => {
    if (pin === ADMIN_PASSWORD) {
      // --- SUCCESS: Runs immediately ---
      setModalError('')
      setIsUnlocked(true)   // Show the table
      setIsModalOpen(false) // Hide the modal
      setModalPassword('')  // Reset PIN
      
    } else {
      // --- ERROR: Runs immediately ---
      setModalError('Wrong PIN. Try again.')
      // Reset the PIN after a short delay so the user sees the error
      setTimeout(() => {
        setModalPassword('')
        setModalError('')
      }, 1000);
    }
  }
  
  // --- Helper to clear state when closing modal ---
  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setModalPassword('');
  }


  return (
    <div>
      {/* Styles for the page, form, table, and NEW MODAL/PINPAD */}
      <style jsx global>{`
        /* --- Keyframe Animations --- */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* --- MODIFICATION: Removed fadeOut and shake keyframes --- */
        
        @keyframes fadeInTable {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* --- End Keyframes --- */
      
        body {
          font-family: Calibri, sans-serif;
        }
        .container {
          max-width: 800px;
          margin: 20px auto;
          padding: 0 10px;
        }
        .login-form {
          /* max-width: 400px; <-- Removed this for consistent width */
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
        
        /* --- NEW: Secondary button style for 'Hide' --- */
        .submit-btn.secondary {
          background-color: #e0e0e0;
          color: black;
          margin-top: 15px; /* Add space above the hide button */
        }
        .submit-btn.secondary:hover {
          background-color: #c7c7c7;
        }
        
        .error {
          color: red;
          margin-top: 10px;
        }
        
        /* --- UPDATED: Return Button Style --- */
        .return-btn {
          padding: 8px 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          /* NEW: Positioned absolutely */
          position: absolute;
          right: 0;
          top: 0;
        }
        .return-btn:hover {
          background-color: #005bb5;
        }
        /* --- END RETURN BUTTON STYLE --- */
        
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
        
        /* --- MODAL STYLES (with new animation) --- */
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
          animation: fadeIn 0.3s ease-out; /* <-- NEW */
        }
        .modal-content {
          background-color: white;
          padding: 20px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          width: 300px;
          text-align: center;
          animation: zoomIn 0.3s ease-out; /* <-- NEW */
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
        
        /* --- MODIFICATION: Removed animation classes --- */
        /* .pin-pad-fade-out, .pin-pad-error, .error-fade-out removed */
        
        /* --- NEW: Credentials table animation class --- */
        .credentials-container {
          animation: fadeInTable 0.8s ease-out;
          margin-bottom: 20px; /* <-- MODIFICATION: Added space before reset dropdown */
        }
        
        /* --- NEW COLLAPSIBLE DROPDOWN STYLES --- */
        .collapsible-container {
          /* max-width: 800px; <-- No longer needed, container handles it */
          /* margin: 40px auto; <-- No longer needed, container handles it */
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden; /* Important for the transition */
        }
        .collapsible-toggle {
          background-color: #f2f2f2;
          border: none;
          width: 100%;
          padding: 10px; /* Matching the submit-btn */
          font-size: 16px; /* Matching the submit-btn */
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
          margin-right: 10px; /* Add some spacing */
        }
        .arrow.open {
          transform: rotate(90deg);
        }
        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease-out; /* The slide transition */
        }
        .collapsible-content.open {
          max-height: 80vh; /* Set a max height for the open state */
          border-top: 1px solid #ccc;
        }
        .iframe-container {
          width: 100%;
          height: 80vh; /* 80% of the viewport height */
          border: 0; /* Remove border from container, it's on the content now */
        }
        .iframe-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        /* --- END NEW STYLES --- */
      `}</style>
      
      <div className="container">
      
        {/* --- UPDATED: Centered Title --- */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1 style={{ margin: 0, paddingBottom: '20px' }}>Admin Panel</h1>
          <button className="return-btn" onClick={() => router.push('/login')}>
            Return to Login
          </button>
        </div>
        {/* --- END OF UPDATED TITLE --- */}

        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Welcome, {user.username}!</h2>
        
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

        {/* --- UPDATED: Credentials Section (wrapper div, no maxWidth on button) --- */}
        <div style={{ marginTop: '40px' }}>
          {isUnlocked ? (
            // --- USER TABLE (Visible only if unlocked) ---
            <div className="credentials-container"> {/* <-- Animation wrapper */}
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
                  {allUsers..map((u) => (
                    <tr key={u.username}>
                      <td>{u.username}</td>
                      <td>{u.password}</td>
                      {/* --- MODIFICATION: Check for default URL --- */}
                      <td>
                        {u.redirect === DEFAULT_REDIRECT_URL ? 'Default' : u.redirect}
                      </td>
                      {/* --- END MODIFICATION --- */}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* --- NEW: Hide Credentials Button --- */}
              <button 
                className="submit-btn secondary" 
                onClick={() => setIsUnlocked(false)}
              >
                Hide Credentials
              </button>
            </div>
            
          ) : (
            // --- VIEW CREDENTIALS BUTTON (Visible only if locked) ---
            <div style={{ marginBottom: '20px' }}> {/* Added wrapper for spacing */}
              <button className="submit-btn" onClick={() => setIsModalOpen(true)}>
                View User Credentials
              </button>
            </div>
          )}
        </div>
        
        {/* --- NEW COLLAPSIBLE DROPDOWN --- */}
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
        
        {/* --- UPDATED PASSWORD MODAL (with animation) --- */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
              
              {/* --- MODIFICATION: Removed all animation classes --- */}
              <div>
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
