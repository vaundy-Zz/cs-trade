# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}

Response 201:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

## Alerts

### List All Alerts
```http
GET /alerts
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "BTC Price Alert",
    "description": "Alert when BTC exceeds $50k",
    "type": "PRICE",
    "symbol": "BTC",
    "operator": "ABOVE",
    "threshold": 50000,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "triggers": [...]  // Last 5 triggers
  }
]
```

### Get Alert by ID
```http
GET /alerts/:id
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "userId": "uuid",
  "name": "BTC Price Alert",
  "description": "Alert when BTC exceeds $50k",
  "type": "PRICE",
  "symbol": "BTC",
  "operator": "ABOVE",
  "threshold": 50000,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "triggers": [...]  // All triggers
}
```

### Create Alert
```http
POST /alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "BTC Price Alert",
  "description": "Alert when BTC exceeds $50k",  // optional
  "type": "PRICE",  // PRICE, VOLATILITY, or ROI
  "symbol": "BTC",
  "operator": "ABOVE",  // ABOVE, BELOW, EQUALS, PERCENTAGE_CHANGE_UP, PERCENTAGE_CHANGE_DOWN
  "threshold": 50000
}

Response 201:
{
  "id": "uuid",
  "userId": "uuid",
  "name": "BTC Price Alert",
  "description": "Alert when BTC exceeds $50k",
  "type": "PRICE",
  "symbol": "BTC",
  "operator": "ABOVE",
  "threshold": 50000,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Update Alert
```http
PUT /alerts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Alert Name",  // optional
  "threshold": 55000,  // optional
  "isActive": false  // optional
}

Response 200:
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Updated Alert Name",
  "description": "Alert when BTC exceeds $50k",
  "type": "PRICE",
  "symbol": "BTC",
  "operator": "ABOVE",
  "threshold": 55000,
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

### Delete Alert
```http
DELETE /alerts/:id
Authorization: Bearer <token>

Response 204: No Content
```

### Get Alert Triggers
```http
GET /alerts/:id/triggers?limit=50&offset=0
Authorization: Bearer <token>

Response 200:
{
  "triggers": [
    {
      "id": "uuid",
      "alertId": "uuid",
      "userId": "uuid",
      "triggeredValue": 51234.56,
      "triggeredAt": "2024-01-01T12:00:00Z",
      "notified": true,
      "notifiedAt": "2024-01-01T12:00:01Z"
    }
  ],
  "total": 123,
  "limit": 50,
  "offset": 0
}
```

## Notifications

### SSE Connection
```http
GET /notifications/sse
Authorization: Bearer <token>
Accept: text/event-stream

Stream Response:
data: {"type":"connected","message":"SSE connection established"}

data: {"userId":"uuid","alertId":"uuid","alertName":"BTC Price Alert","type":"PRICE","message":"Alert triggered...","value":51234.56,"threshold":50000,"timestamp":"2024-01-01T12:00:00Z"}
```

### Get Notification History
```http
GET /notifications/history?limit=50&offset=0
Authorization: Bearer <token>

Response 200:
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "alertId": "uuid",
      "channel": "sse",
      "message": "Alert triggered...",
      "sentAt": "2024-01-01T12:00:00Z",
      "success": true,
      "error": null
    }
  ],
  "total": 234,
  "limit": 50,
  "offset": 0
}
```

### Send Test Notification
```http
POST /notifications/test
Authorization: Bearer <token>

Response 200:
{
  "message": "Test notification sent",
  "notification": {
    "userId": "uuid",
    "alertId": "test",
    "type": "test",
    "message": "This is a test notification",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Alert not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Notification rate limit exceeded",
  "message": "Maximum 50 notifications per hour allowed"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

## Rate Limits

- **API Requests**: 100 requests per minute per IP
- **Notifications**: 50 notifications per hour per user

## Alert Types

### PRICE
Monitor current asset price.

### VOLATILITY
Track price volatility (percentage change).

### ROI
Monitor return on investment.

## Condition Operators

### ABOVE
Trigger when value is greater than threshold.

### BELOW
Trigger when value is less than threshold.

### EQUALS
Trigger when value equals threshold (±0.01 tolerance).

### PERCENTAGE_CHANGE_UP
Trigger when percentage change is positive and >= threshold.

### PERCENTAGE_CHANGE_DOWN
Trigger when percentage change is negative and absolute value >= threshold.

## Deduplication

Alerts use a 60-minute deduplication window. If an alert is triggered and then triggered again within 60 minutes, the second trigger will be ignored to prevent spam.

## WebSocket Alternative

While the current implementation uses SSE for real-time notifications, the architecture supports WebSocket as an alternative. To implement WebSocket:

1. Replace SSE endpoint with WebSocket server
2. Update client to use WebSocket connection
3. Maintain same message format for notifications

SSE was chosen for simplicity and better compatibility with HTTP/2, but WebSocket offers bidirectional communication if needed.
