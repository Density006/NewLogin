// pages/login.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'

// This is a simple form component
function LoginForm() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false) // <-- ADDED for modal

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

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
      `}</style>
      
      {/* --- LOGIN FORM --- */}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button className="submit-btn" type="submit">
          Login
        </button>
        {errorMsg && <p className="error">{errorMsg}</p>}
        
        {/* --- ADDED: Forgot Password Link --- */}
        <div className="forgot-password">
          <button 
            type="button" 
            className="forgot-password-btn" 
            onClick={() => setIsModalOpen(true)}
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
