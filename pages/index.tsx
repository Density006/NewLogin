// pages/index.tsx
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'

// This is a protected page.
// It can only be accessed if the user is logged in.
export default function ProtectedPage({ user }: { user: SessionData }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {user.username}!</h1>
      <p>You are logged in.</p>
      <p>
        <a href={user.redirectUrl}>Go to your page</a>
      </p>
    </div>
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
