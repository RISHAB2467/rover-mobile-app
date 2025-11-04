# Rover API Endpoints

Your API at `https://rover-api-fb8n.onrender.com` has the following endpoints:

## ✅ Available Endpoints

### 1. **Root / Health Check**
```
GET /
```
**Response:**
```json
{
  "status": "success",
  "message": "🚀 Rover Backend is LIVE!",
  "docs": "/docs"
}
```

### 2. **Receive Detection Data from Raspberry Pi**
```
POST /api/rover/update
```
**Request Body:**
```json
{
  "person_1": {
    "person_name": "Priyanshu Roy",
    "is_known": true,
    "suspicious_level": "High",
    "detected_items": ["knife"],
    "detected_action": "furtive"
  }
}
```

### 3. **Get Detection History/Reports**
```
GET /api/reports?limit=50
```
**Query Parameters:**
- `limit` (optional, default: 50) - Number of events to return

**Response:** Returns last N detection events

### 4. **API Documentation**
```
GET /docs
```
Swagger UI documentation

```
GET /openapi.json
```
OpenAPI 3.1.0 specification

---

## 🔄 Integration with React Native App

### Updated Functions in `roverService.js`:

1. **`getDetectionReports(limit)`** - Fetch detection history from `/api/reports`
2. **`sendDetectionData(data)`** - Send detection data to `/api/rover/update`
3. **`checkApiHealth()`** - Check if API is live via `/`

### Test Buttons on Dashboard:

1. **Test API Connection** - Runs 5 tests to verify all endpoints
2. **Get Detection Reports** - Fetches recent detection events
3. **Get Rover Status** - (Mock mode - endpoint not implemented yet)

---

## 📊 Test Results

When you click "Test API Connection", you should now see **5/5 tests passed**:

1. ✅ Root Endpoint (/)
2. ✅ Health Check
3. ✅ Reports Endpoint (/api/reports)
4. ✅ API Documentation (/openapi.json)
5. ✅ Rover Update (/api/rover/update)

---

## 🚀 What Changed

### Before:
- API tests looked for `/rover/status`, `/rover/camera/status`, `/auth/login`
- These endpoints don't exist on your API → **1/5 tests passed**

### After:
- Updated tests to match your actual API structure
- Tests now check: `/`, `/api/reports`, `/api/rover/update`, `/openapi.json`
- Added new functions to work with your detection system → **5/5 tests should pass**

---

## 💡 Next Steps

1. **Test the API** - Click "Test API Connection" button → should see 5/5 pass
2. **Fetch Reports** - Click "Get Detection Reports" to see detection events
3. **Send Detection Data** - Use `roverService.sendDetectionData()` to push data from Pi
