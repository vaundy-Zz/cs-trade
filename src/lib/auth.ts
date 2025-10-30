import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    {
      id: "steam",
      name: "Steam",
      type: "oauth",
      wellKnown: "https://steamcommunity.com/openid",
      authorization: {
        url: "https://steamcommunity.com/openid/login",
        params: {
          "openid.mode": "checkid_setup",
          "openid.ns": "http://specs.openid.net/auth/2.0",
          "openid.identity":
            "http://specs.openid.net/auth/2.0/identifier_select",
          "openid.claimed_id":
            "http://specs.openid.net/auth/2.0/identifier_select",
          "openid.return_to": process.env.STEAM_CALLBACK_URL,
        },
      },
      idToken: false,
      checks: ["none"],
      profile(profile: {
        sub?: string;
        id?: string;
        personaname?: string;
        name?: string;
        avatarfull?: string;
        avatar?: string;
      }) {
        const steamId = profile.sub || profile.id || "unknown";
        return {
          id: steamId,
          name: profile.personaname || profile.name || `User ${steamId}`,
          email: `${steamId}@steam.local`,
          image: profile.avatarfull || profile.avatar || "",
        };
      },
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub as string,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
