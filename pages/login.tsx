// pages/login.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'

// This is a simple form component
function LoginForm() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

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
      `}</style>
      
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
      </form>
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
