import { GET, PUT } from "@/app/api/preferences/route";

const mockAuth = jest.fn();
const mockPrisma = {
  userPreferences: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
};

jest.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Preferences API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/preferences", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should create default preferences if none exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.userPreferences.findUnique.mockResolvedValue(null);
      mockPrisma.userPreferences.create.mockResolvedValue({
        id: "pref-1",
        userId: "user-1",
        theme: "light",
        notifications: true,
        emailAlerts: false,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userId).toBe("user-1");
      expect(mockPrisma.userPreferences.create).toHaveBeenCalled();
    });

    it("should return existing preferences", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.userPreferences.findUnique.mockResolvedValue({
        id: "pref-1",
        userId: "user-1",
        theme: "dark",
        notifications: false,
        emailAlerts: true,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.theme).toBe("dark");
    });
  });

  describe("PUT /api/preferences", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/preferences", {
        method: "PUT",
        body: JSON.stringify({ theme: "dark" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should update preferences", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.userPreferences.upsert.mockResolvedValue({
        id: "pref-1",
        userId: "user-1",
        theme: "dark",
        notifications: true,
        emailAlerts: true,
      });

      const request = new Request("http://localhost/api/preferences", {
        method: "PUT",
        body: JSON.stringify({
          theme: "dark",
          notifications: true,
          emailAlerts: true,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.theme).toBe("dark");
      expect(mockPrisma.userPreferences.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        })
      );
    });
  });
});
