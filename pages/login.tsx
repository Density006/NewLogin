// pages/login.tsx
import React, { useState, useEffect, useRef } from 'react' // <-- NEW: Imported useRef
import { useRouter } from 'next/router'

// This is a simple form component
function LoginForm() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false) 

  // --- NEW: State for Easter Egg ---
  const [keySequence, setKeySequence] = useState<string[]>([]);
  // Use a ref for the timer to avoid re-renders
  const keyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- UPDATED: Key listener for both shortcuts ---
  useEffect(() => {
    const easterEggSequence = ['m', 't', 'b'];

    function handleKeyDown(event: KeyboardEvent) {
      // Don't track keys if user is typing in a form
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      // 1. Admin Shortcut
      if (event.key === '\') {
        // --- THIS IS THE ADDED LINE ---
        console.warn('Admin shortcut key (`) pressed.');
        // -----------------------------
        router.push('/admin-redirect'); // <-- UPDATED: Go to new redirect page
      }

      // 2. Easter Egg Shortcut
      // Clear the previous 5-second timer
      if (keyTimerRef.current) {
        clearTimeout(keyTimerRef.current);
      }

      const key = event.key.toLowerCase();
      
      // Check if the key is the *next* one in the sequence
      let newSequence = [...keySequence];
      if (easterEggSequence[newSequence.length] === key) {
        newSequence.push(key);
      } else if (key === 'm') {
        // If it's the wrong key, but it's 'm', start over
        newSequence = ['m'];
      } else {
        // Any other key resets the sequence
        newSequence = [];
      }

      setKeySequence(newSequence);

      // Check for success
      if (newSequence.join('') === 'mtb') {
        router.push('/easter-egg');
        setKeySequence([]); // Reset
      } else {
        // Set a 5-second timer to reset the sequence
        keyTimerRef.current = setTimeout(() => {
          setKeySequence([]);
        }, 5000); // 5 seconds
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyTimerRef.current) {
        clearTimeout(keyTimerRef.current);
      }
    };
  }, [router, keySequence]); // Add keySequence to dependency array


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true); // <-- Start loading
    setErrorMsg(''); // Clear old errors

    const body = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 200) {
        const { redirectUrl } = await res.json()
        // On success, redirect them to their target page
        window.location.href = redirectUrl;
      } else {
        const { message } = await res.json()
        setErrorMsg(message)
      }
    } catch (error) {
      setErrorMsg('An unknown error occurred')
    } finally {
      setIsLoading(false); // <-- Stop loading
    }
  }

  // --- ADDED: Modal Handler ---
  const handleResetPassword = () => {
    // Navigate to the new reset page
    router.push('/reset-password');
  };

  return (
    <>
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
          transition: opacity 0.3s ease-out; /* <-- Added transition */
        }
        
        /* --- ADDED: Loading state style --- */
        .login-form.loading {
          opacity: 0.7;
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
        
        /* --- NEW: Style for disabled inputs --- */
        .form-group input:disabled {
          background-color: #f0f0f0;
          cursor: not-allowed;
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
          transition: background-color 0.2s; /* <-- Added transition */
        }
        .submit-btn:hover {
          background-color: #005bb5;
        }
        
        /* --- ADDED: Disabled button state --- */
        .submit-btn:disabled { 
          background-color: #005bb5;
          cursor: wait;
        }
        
        .error {
          color: red;
          margin-top: 10px;
        }
        
        /* --- ADDED: Forgot Password Link Style --- */
        .forgot-password {
          text-align: center;
          margin-top: 15px;
        }
        .forgot-password-btn {
          background: none;
          border: none;
          color: #0070f3;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }
        .forgot-password-btn:hover {
          color: #005bb5;
        }
        
        /* --- ADDED: Modal Styles --- */
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
        .modal-content h3 {
          margin-top: 0;
        }
        .modal-buttons {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
        }
        .modal-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .modal-btn.primary {
          background-color: #0070f3;
          color: white;
        }
        .modal-btn.secondary {
          background-color: #e0e0e0;
          color: black;
        }
        
        /* --- NEW: Case Sensitive Note Style --- */
        .case-sensitive-note {
          text-align: center;
          font-size: 12px;
          color: #555;
          margin-top: 15px;
          margin-bottom: -5px; /* Pulls the forgot password link up slightly */
        }
      `}</style>
      
      {/* --- LOGIN FORM --- */}
      <form className={`login-form ${isLoading ? 'loading' : ''}`} onSubmit={handleSubmit}>
        
        {/* --- CHANGED: Removed fieldset, added disabled prop to inputs --- */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username" 
            name="username" 
            type="text" 
            required 
            disabled={isLoading} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            disabled={isLoading} 
          />
        </div>
        {/* --- END OF CHANGE --- */}

        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Login'}
        </button>
        {errorMsg && <p className="error">{errorMsg}</p>}
        
        {/* --- ADDED: Case Sensitive Note --- */}
        <p className="case-sensitive-note">
          Note: Username and Password are case sensitive.
        </p>
        
        {/* --- ADDED: Forgot Password Link --- */}
        <div className="forgot-password">
          <button 
            type="button" 
            className="forgot-password-btn" 
            onClick={() => !isLoading && setIsModalOpen(true)} // Don't allow click if loading
          >
            Forgot Password?
          </button>
        </div>
      </form>
      
      {/* --- ADDED: Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Password Reset</h3>
            <p>Would you like to reset your password?</p>
            <div className="modal-buttons">
              <button 
                className="modal-btn secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn primary" 
                onClick={handleResetPassword}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function LoginPage() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <LoginForm />
    </div>
  )
}

