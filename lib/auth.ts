import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const steamProvider: Provider = {
  id: "steam",
  name: "Steam",
  type: "oidc",
  authorization: {
    url: "https://steamcommunity.com/openid/login",
    params: {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${baseUrl}/api/auth/callback/steam`,
      "openid.realm": baseUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    },
  },
  token: {
    url: "https://steamcommunity.com/openid/login",
    async request({ params }) {
      if (!params || typeof params !== "object") {
        throw new Error("Invalid OpenID parameters");
      }

      const searchParams = new URLSearchParams(params as Record<string, string>);
      const claimedId = searchParams.get("openid.claimed_id");

      if (!claimedId) {
        throw new Error("Missing claimed_id from Steam response");
      }

      const steamId = claimedId.split("/").pop();
      if (!steamId) {
        throw new Error("Invalid Steam ID");
      }

      return {
        tokens: {
          access_token: steamId,
        },
      };
    },
  },
  userinfo: {
    async request({ tokens }) {
      const steamId = tokens.access_token;

      if (!steamId) {
        throw new Error("Missing Steam ID token");
      }

      const apiKey = process.env.STEAM_API_KEY;

      if (!apiKey) {
        return {
          id: steamId,
          name: `Steam User ${steamId}`,
          email: null,
          image: null,
        };
      }

      try {
        const response = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
        );
        const data = await response.json();
        const player = data.response?.players?.[0];

        if (!player) {
          throw new Error("Steam profile not found");
        }

        return {
          id: steamId,
          name: player.personaname,
          email: null,
          image: player.avatarfull || player.avatarmedium || player.avatar,
        };
      } catch (error) {
        console.error("Steam profile lookup failed", error);
        return {
          id: steamId,
          name: `Steam User ${steamId}`,
          email: null,
          image: null,
        };
      }
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.image,
    };
  },
};

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    steamProvider,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
