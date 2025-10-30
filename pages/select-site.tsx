// pages/select-site.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'

type SelectSiteProps = {
  user: SessionData;
  sites: string[];
}

export default function SelectSitePage({ user, sites }: SelectSiteProps) {
  const router = useRouter()
  // Initialize state with the first site in the list
  const [selectedSite, setSelectedSite] = useState(sites[0])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedSite) {
      // Use window.location.href for external navigation
      window.location.href = selectedSite
    }
  }

  return (
    <>
      {/* Styles copied from login.tsx for consistency */}
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
        .form-group select {
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
        .submit-btn:disabled {
          background-color: #a0a0a0;
          cursor: not-allowed;
        }
      `}</style>
      
      <div>
        <h1 style={{ textAlign: 'center' }}>Welcome, {user.username}!</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="site-select">Please select a site to continue:</label>
            <select
              id="site-select"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              {sites.map((siteUrl) => (
                <option key={siteUrl} value={siteUrl}>
                  {siteUrl}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="submit-btn" 
            type="submit" 
            disabled={!selectedSite}
          >
            Pick
          </button>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps = withIronSessionSsr(
  async function ({ req, res }) {
    const user = req.session.user

    // 1. Check if user is logged in
    if (user === undefined) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: { isLoggedIn: false, username: '', redirectUrl: '' } as SessionData,
          sites: [],
        },
      }
    }

    // 2. Check if user actually has multiple sites
    const sites = user.redirectSites
    if (!sites || sites.length === 0) {
      // This user shouldn't be here. Send them to their default page.
      res.setHeader('location', user.redirectUrl || '/')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: user,
          sites: [],
        },
      }
    }

    // 3. User is logged in and has sites, render the page
    return {
      props: { 
        user: user,
        sites: sites 
      },
    }
  },
  sessionOptions
)
