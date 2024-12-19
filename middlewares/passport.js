import bcrypt from 'bcryptjs';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "dotenv";
import db from "../utils/db.js";
config();

function generateRandomPassword(length = 16) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'; 
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
    const numericChars = '0123456789'; 
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'; 
    const allChars = lowercaseChars + uppercaseChars + numericChars + specialChars;
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }
    return password;
  }

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await db("users")
          .where({ email: profile.emails[0].value })
          .first();
        if (!user) {
          const fakeBcryptPassword = generateRandomPassword();
          const hashFakePassword = await bcrypt.hash(fakeBcryptPassword, 8);
          const [newUser] = await db("users")
            .insert({
              email: profile.emails[0].value,
              password: hashFakePassword,
              role: "guest",
            })
            .returning("*");
          return done(null, newUser);
        }
        return done(null, user);
      } catch (err) {
        console.error("Error during OAuth authentication:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
