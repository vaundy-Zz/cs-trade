import { authConfig } from "@/lib/auth";
import bcrypt from "bcryptjs";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Credentials Provider", () => {
    const credentialsProvider = authConfig.providers.find(
      (p: any) => p.id === "credentials"
    ) as any;

    it("should reject invalid credentials", async () => {
      await expect(
        credentialsProvider.authorize({
          email: "",
          password: "",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should reject when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        credentialsProvider.authorize({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should reject when password is invalid", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User",
        image: null,
      });

      await expect(
        credentialsProvider.authorize({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should accept valid credentials", async () => {
      const password = "correctpassword";
      const hashedPassword = await bcrypt.hash(password, 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User",
        image: null,
      });

      const result = await credentialsProvider.authorize({
        email: "test@example.com",
        password,
      });

      expect(result).toEqual({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        image: null,
      });
    });
  });

  describe("JWT Callback", () => {
    it("should add user id to token", async () => {
      const token = { sub: "token-sub" };
      const user = { id: "user-123" };

      const result = await authConfig.callbacks.jwt({
        token,
        user,
        account: null,
        trigger: "signIn",
        isNewUser: false,
        session: undefined,
      });

      expect(result.id).toBe("user-123");
    });

    it("should use sub as fallback for id", async () => {
      const token = { sub: "token-sub" };

      const result = await authConfig.callbacks.jwt({
        token,
        user: undefined,
        account: null,
        trigger: "update",
        isNewUser: false,
        session: undefined,
      });

      expect(result.id).toBe("token-sub");
    });
  });

  describe("Session Callback", () => {
    it("should add user id to session", async () => {
      const session = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2025-01-01",
      };
      const token = { id: "user-123" };

      const result = await authConfig.callbacks.session({
        session,
        token,
        user: undefined,
        newSession: undefined,
        trigger: "getSession",
      });

      expect(result.user.id).toBe("user-123");
    });
  });
});
