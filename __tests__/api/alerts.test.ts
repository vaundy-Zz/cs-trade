import { GET, POST } from "@/app/api/alerts/route";
import { PUT, DELETE } from "@/app/api/alerts/[id]/route";

const mockAuth = jest.fn();
const mockPrisma = {
  alert: {
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

describe("Alerts API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/alerts", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return user alerts", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.findMany.mockResolvedValue([
        {
          id: "alert-1",
          userId: "user-1",
          title: "Test Alert",
          type: "price",
          isActive: true,
        },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe("Test Alert");
    });
  });

  describe("POST /api/alerts", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/alerts", {
        method: "POST",
        body: JSON.stringify({ title: "Test", type: "price" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if required fields are missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const request = new Request("http://localhost/api/alerts", {
        method: "POST",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Title and type are required");
    });

    it("should create alert", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.create.mockResolvedValue({
        id: "alert-1",
        userId: "user-1",
        title: "New Alert",
        type: "price",
        description: "Test description",
        isActive: true,
      });

      const request = new Request("http://localhost/api/alerts", {
        method: "POST",
        body: JSON.stringify({
          title: "New Alert",
          type: "price",
          description: "Test description",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe("New Alert");
    });
  });

  describe("PUT /api/alerts/[id]", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost/api/alerts/alert-1", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
      });

      const response = await PUT(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("should return 403 if user does not own the alert", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.findUnique.mockResolvedValue({
        id: "alert-1",
        userId: "user-2",
      });

      const request = new Request("http://localhost/api/alerts/alert-1", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
      });

      const response = await PUT(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
    });

    it("should update alert", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.findUnique.mockResolvedValue({
        id: "alert-1",
        userId: "user-1",
      });
      mockPrisma.alert.update.mockResolvedValue({
        id: "alert-1",
        userId: "user-1",
        title: "Updated Alert",
        type: "price",
      });

      const request = new Request("http://localhost/api/alerts/alert-1", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated Alert", type: "price" }),
      });

      const response = await PUT(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe("Updated Alert");
    });
  });

  describe("DELETE /api/alerts/[id]", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = {} as Request;

      const response = await DELETE(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("should return 403 if user does not own the alert", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.findUnique.mockResolvedValue({
        id: "alert-1",
        userId: "user-2",
      });

      const request = {} as Request;

      const response = await DELETE(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
    });

    it("should delete alert", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.alert.findUnique.mockResolvedValue({
        id: "alert-1",
        userId: "user-1",
      });
      mockPrisma.alert.delete.mockResolvedValue({ id: "alert-1" });

      const request = {} as Request;

      const response = await DELETE(request, { params: { id: "alert-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Alert deleted successfully");
    });
  });
});
