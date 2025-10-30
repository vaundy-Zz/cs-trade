import { GET, POST } from "@/app/api/watchlists/route";
import { PUT, DELETE } from "@/app/api/watchlists/[id]/route";

const mockAuth = jest.fn();
const mockPrisma = {
  watchlist: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Watchlists API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/watchlists", () => {
    it("should return 401 for unauthenticated users", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return watchlists for authenticated users", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.watchlist.findMany.mockResolvedValue([
        {
          id: "watchlist-1",
          userId: "user-1",
          name: "My Watchlist",
          description: "Test",
          items: [],
        },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("My Watchlist");
    });
  });

  describe("POST /api/watchlists", () => {
    it("should return 401 for unauthenticated users", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/watchlists", {
        method: "POST",
        body: JSON.stringify({ name: "Watchlist" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when name is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const request = new Request("http://localhost/api/watchlists", {
        method: "POST",
        body: JSON.stringify({ description: "Test" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name is required");
    });

    it("should create watchlist with items", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.watchlist.create.mockResolvedValue({
        id: "watchlist-1",
        userId: "user-1",
        name: "Favorites",
        description: "Test",
        items: [
          {
            id: "item-1",
            watchlistId: "watchlist-1",
            itemType: "game",
            itemId: "123",
            itemName: "Half-Life",
          },
        ],
      });

      const request = new Request("http://localhost/api/watchlists", {
        method: "POST",
        body: JSON.stringify({
          name: "Favorites",
          description: "Test",
          items: [
            { itemType: "game", itemId: "123", itemName: "Half-Life" },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("Favorites");
      expect(data.items).toHaveLength(1);
    });
  });

  describe("PUT /api/watchlists/[id]", () => {
    it("should return 401 for unauthenticated users", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/watchlists/1", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
      });

      const response = await PUT(request, { params: { id: "watchlist-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("should return 403 if user does not own watchlist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.watchlist.findUnique.mockResolvedValue({
        id: "watchlist-1",
        userId: "user-2",
      });

      const request = new Request("http://localhost/api/watchlists/1", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
      });

      const response = await PUT(request, { params: { id: "watchlist-1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
    });

    it("should update watchlist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.watchlist.findUnique.mockResolvedValue({
        id: "watchlist-1",
        userId: "user-1",
      });
      mockPrisma.watchlist.update.mockResolvedValue({
        id: "watchlist-1",
        userId: "user-1",
        name: "Updated",
        description: "Updated description",
        items: [],
      });

      const request = new Request("http://localhost/api/watchlists/1", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated", description: "Updated" }),
      });

      const response = await PUT(request, { params: { id: "watchlist-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated");
    });
  });

  describe("DELETE /api/watchlists/[id]", () => {
    it("should return 401 for unauthenticated users", async () => {
      mockAuth.mockResolvedValue(null);

      const request = {} as Request;

      const response = await DELETE(request, { params: { id: "watchlist-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("should delete watchlist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.watchlist.findUnique.mockResolvedValue({
        id: "watchlist-1",
        userId: "user-1",
      });
      mockPrisma.watchlist.delete.mockResolvedValue({ id: "watchlist-1" });

      const request = {} as Request;

      const response = await DELETE(request, { params: { id: "watchlist-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Watchlist deleted successfully");
    });
  });
});
