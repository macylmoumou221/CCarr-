# 🚀 Sprint 3 Quick Start Guide

## What's New in Sprint 3?

CCarré now has a complete **exchange and messaging system** with **real-time WebSocket support**!

New features:
- 💬 **Exchanges** – Users can request and manage exchanges
- 📨 **Messaging** – Real-time chat within exchanges (Socket.io)
- 🔔 **Notifications** – Automatic notifications for all events
- ⭐ **Favorites** – Save favorite annonces
- 📊 **History** – Track ongoing and completed exchanges

---

## Installation & Setup

### 1. Prerequisites
```bash
# MongoDB running on localhost:27017
mongosh  # Test connection
```

### 2. Install Dependencies
```bash
npm install
```

Socket.io is already installed (`npm install socket.io @types/socket.io`)

### 3. Check Environment Variables
```bash
cat .env  # Should have MONGODB_URI, JWT_SECRET, etc.
```

### 4. Start the Server
```bash
npm run dev
```

Expected output:
```
[OK] CCarré API démarrée sur http://localhost:5000
[INFO] WebSocket disponible sur ws://localhost:5000
```

---

## 📋 First-Time Testing

### Step 1: Create Users
```bash
# User 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Martin",
    "email": "alice@etu.univ-amu.fr",
    "password": "Password123!"
  }'

# User 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Dupont",
    "email": "bob@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

### Step 2: Confirm Emails
Check email inbox for confirmation codes, then confirm:
```bash
curl -X POST http://localhost:5000/api/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@etu.univ-amu.fr", "code": "12345678"}'
```

### Step 3: Login Both Users
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@etu.univ-amu.fr", "password": "Password123!"}'
```

Save the token: `ALICE_TOKEN="eyJ..."`

### Step 4: Create an Annonce (Alice)
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro",
    "description": "Excellent state",
    "type": "vente",
    "category": "Tech",
    "price": 1200
  }'
```

Save the ID: `ANNONCE_ID="..."`

### Step 5: Add to Favorites (Bob)
```bash
curl -X POST http://localhost:5000/api/favorites/$ANNONCE_ID \
  -H "Authorization: Bearer $BOB_TOKEN"
```

### Step 6: Create Exchange (Bob)
```bash
curl -X POST http://localhost:5000/api/echanges \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "annonceId": "'$ANNONCE_ID'",
    "messageInitial": "Interested in exchanging!"
  }'
```

Save: `ECHANGE_ID="..."`

### Step 7: Accept Exchange (Alice)
```bash
curl -X PUT http://localhost:5000/api/echanges/$ECHANGE_ID/accept \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

### Step 8: Send Message (Bob)
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "echangeId": "'$ECHANGE_ID'",
    "contenu": "When can we meet?"
  }'
```

### Step 9: Get Messages (Alice)
```bash
curl -X GET http://localhost:5000/api/messages/$ECHANGE_ID \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

### Step 10: Check Notifications (Bob)
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $BOB_TOKEN"
```

✅ **Done! All features working!**

---

## 🔌 WebSocket Testing (Real-time Chat)

### JavaScript Test Script

Create `test-socket.js`:

```javascript
const io = require('socket.io-client');

const token = 'YOUR_TOKEN_HERE';
const exchangeId = 'YOUR_EXCHANGE_ID_HERE';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  
  // Join exchange room
  socket.emit('join_echange', { echangeId }, (err) => {
    if (err) console.error('❌ Error joining:', err);
    else console.log('✅ Joined exchange');
  });
});

socket.on('receive_message', (data) => {
  console.log('📩 New message:', data.expediteur.firstName, ':', data.contenu);
});

socket.on('notification', (data) => {
  console.log('🔔 Notification:', data.type, '-', data.contenu);
});

socket.on('user_joined', (data) => {
  console.log('👥', data.message);
});

// Send a message
setTimeout(() => {
  socket.emit('send_message',
    { echangeId, contenu: 'Hello from Socket.io!' },
    (err, messageId) => {
      if (err) console.error('❌ Error:', err);
      else console.log('✅ Message sent:', messageId);
    }
  );
}, 1000);

socket.on('disconnect', () => {
  console.log('⚠️ Disconnected');
  process.exit(0);
});
```

Run it:
```bash
npm install socket.io-client
node test-socket.js
```

---

## 📚 Full Documentation

For detailed information:

1. **API Reference** → `SPRINT_3_IMPLEMENTATION.md`
   - All 13 REST endpoints
   - WebSocket event documentation
   - cURL examples
   - JavaScript examples
   - Error handling

2. **Testing Guide** → `SPRINT_3_TESTING_GUIDE.md`
   - Step-by-step workflow
   - Error scenarios
   - Database verification
   - Postman collection

3. **Implementation Summary** → `SPRINT_3_SUMMARY.md`
   - Feature overview
   - Architecture details
   - Security features
   - Database indexes

---

## 🔍 API Endpoints at a Glance

### Exchanges
```
POST   /api/echanges                 Create
GET    /api/echanges                 List
PUT    /api/echanges/:id/accept      Accept
PUT    /api/echanges/:id/refuse      Refuse
PUT    /api/echanges/:id/complete    Complete
GET    /api/echanges/history         History
```

### Messages
```
POST   /api/messages                 Send
GET    /api/messages/:echangeId      Get all
```

### Notifications
```
GET    /api/notifications            List
PUT    /api/notifications/:id/read   Mark read
PUT    /api/notifications/read-all   Mark all read
```

### Favorites
```
GET    /api/favorites                List
POST   /api/favorites/:annonceId     Add
DELETE /api/favorites/:annonceId     Remove
```

---

## 🛠️ Troubleshooting

### "Port 5000 already in use"
```bash
# Kill existing process
Get-Process -Name node | Stop-Process -Force
npm run dev
```

### "MongoDB connection failed"
```bash
# Check MongoDB is running
mongosh
# If not running, start it
```

### "WebSocket connection refused"
```javascript
// Make sure to include auth token
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### "Unauthorized errors"
```bash
# Check token is valid
curl -X GET http://localhost:5000/api/echanges \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✨ Key Features Recap

✅ **Create Exchanges**
- Users propose exchanges on annonces
- Owner can accept or refuse
- Cannot exchange on own annonces

✅ **Real-time Messaging**
- Socket.io for instant delivery
- Messages saved to MongoDB
- Only exchange members can access

✅ **Automatic Notifications**
- Exchange requests
- Exchange accepted/refused
- New messages
- Exchange completed

✅ **Favorites Management**
- Add/remove annonces
- View all favorites
- Prevent duplicates

✅ **Exchange History**
- Track ongoing exchanges
- View completed exchanges
- Sort and filter

---

## 🚢 Deployment Notes

Before deploying to production:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Update CORS origin in `src/app.ts`
4. Configure Cloudinary for production
5. Set secure JWT secret (64+ chars)
6. Enable HTTPS (Socket.io supports it)
7. Configure email service for production
8. Add rate limiting (optional)

---

## 📞 Support Resources

- **TypeScript Interfaces** – Check `src/models/` for data structures
- **Error Handling** – See `src/utils/ApiError.ts`
- **Middleware** – Check `src/middlewares/`
- **WebSocket Logic** – See `src/config/socket.ts`
- **Full Examples** → See SPRINT_3_IMPLEMENTATION.md

---

## 🎯 Next Features (Ideas)

Consider adding:
- Message editing/deletion
- Read receipts ("seen" status)
- Typing indicators
- Exchange ratings/reviews
- File attachments
- Message search
- User profiles
- Admin dashboard

---

## ✅ You're All Set!

The backend is ready for:
- Frontend integration
- Testing in production
- Real-world usage

Happy coding! 🚀

