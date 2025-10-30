// lib/iron-session.d.ts
import 'iron-session';
import { SessionData } from './session'; // Import our session data type

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionData;
  }
}
