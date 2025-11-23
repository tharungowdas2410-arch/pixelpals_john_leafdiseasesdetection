import passport from "passport";
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { env } from "./env";
import authService from "../services/auth.service";
import logger from "../utils/logger";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails?.[0]?.value;
        if (!email) {
          return done(new Error("Email not provided by Google"), undefined);
        }

        const user = await authService.handleOAuthLogin({
          providerId: id,
          name: displayName,
          email
        });

        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      } catch (error) {
        logger.error("Google OAuth failure", { error });
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;

