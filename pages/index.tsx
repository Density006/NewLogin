// pages/index.tsx
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { useRouter } from 'next/router' // <-- NEW: Import useRouter
import React, { useEffect } from 'react' // <-- NEW: Import useEffect

// This is a protected page.
// It can only be accessed if the user is logged in.
export default function ProtectedPage({ user }: { user: SessionData }) {
  const router = useRouter() // <-- NEW: Initialize router

  // --- NEW: Backtick key listener ---
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '`') {
        router.push('/login');
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]); // Add router to dependency array

  // --- NEW: Button click handler ---
  const handleGoToPage = () => {
    // Use window.location.href to handle both internal and external URLs
    window.location.href = user.redirectUrl; 
  };

  return (
    <>
      {/* --- NEW: Global styles --- */}
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
          word-wrap: break-word; /* Ensure long usernames don't break layout */
        }
        p {
          font-size: 18px;
          color: #333;
        }
        .submit-btn {
          width: 100%;
          max-width: 400px; /* Match other pages */
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }
        .submit-btn:hover {
          background-color: #005bb5;
        }
      `}</style>
      
      {/* --- NEW: Centered container --- */}
      <div className="container">
        <h1>Welcome, {user.username}!</h1>
        <p>You are already logged in.</p>
        
        {/* --- NEW: Changed link to button --- */}
        <button className="submit-btn" onClick={handleGoToPage}>
          Go to your page
        </button>
      </div>
    </>
  )
}

// This function runs on the server before the page is rendered
export const getServerSideProps = withIronSessionSsr(
  async function ({ req, res }) {
    const user = req.session.user

    if (user === undefined) {
      // If no user, redirect to login
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: { isLoggedIn: false, username: '', redirectUrl: '' } as SessionData,
        },
      }
    }

    // If user is logged in, pass their info to the page
    return {
      props: { user: req.session.user },
    }
  },
  sessionOptions
)
