# Sprint 3 – Quick Testing Guide

## Prerequisites

Before testing, ensure:
- MongoDB is running on `127.0.0.1:27017`
- Server is running: `npm run dev`
- You have cURL or Postman installed
- You have created at least 2 user accounts

---

## Complete Testing Workflow

### STEP 1: Create Two User Accounts

**User 1 (Alice):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Martin",
    "email": "alice@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

**User 2 (Bob):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Dupont",
    "email": "bob@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

---

### STEP 2: Confirm Emails

Get the confirmation codes from your email inbox and confirm:

**Alice:**
```bash
curl -X POST http://localhost:5000/api/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@etu.univ-amu.fr",
    "code": "<code_from_email>"
  }'
```

**Bob:**
```bash
curl -X POST http://localhost:5000/api/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@etu.univ-amu.fr",
    "code": "<code_from_email>"
  }'
```

---

### STEP 3: Login Both Users

**Alice Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "firstName": "Alice", ... }
  }
}
```

Save the tokens:
```bash
ALICE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
BOB_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Bob Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

---

### STEP 4: Alice Creates an Annonce

```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 14 pouces",
    "description": "Excellent état, très peu utilisé. Parfait pour la programmation et le design graphique.",
    "type": "vente",
    "category": "Informatique",
    "price": 1200
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "title": "MacBook Pro 14 pouces",
    ...
  }
}
```

Save the annonce ID:
```bash
ANNONCE_ID="67a1b2c3d4e5f6g7h8i9j0k1"
```

---

### STEP 5: Bob Adds the Annonce to Favorites

```bash
curl -X POST http://localhost:5000/api/favorites/$ANNONCE_ID \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Annonce ajoutée aux favoris",
  "data": ["67a1b2c3d4e5f6g7h8i9j0k1"]
}
```

---

### STEP 6: Bob Gets His Favorites

```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer $BOB_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "title": "MacBook Pro 14 pouces",
      "description": "Excellent état...",
      ...
    }
  ]
}
```

---

### STEP 7: Bob Creates an Exchange Request

```bash
curl -X POST http://localhost:5000/api/echanges \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "annonceId": "'$ANNONCE_ID'",
    "messageInitial": "Bonjour! Je suis très intéressé par votre MacBook. Est-ce que vous seriez ouvert à un échange?"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Demande d'échange créée avec succès",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "utilisateurDemandeur": { "firstName": "Bob", ... },
    "utilisateurProprietaire": { "firstName": "Alice", ... },
    "annonce": { "_id": "67a1b2c3d4e5f6g7h8i9j0k1", "title": "MacBook Pro 14 pouces" },
    "statut": "EN_ATTENTE",
    "messageInitial": "Bonjour! Je suis très intéressé...",
    ...
  }
}
```

Save the exchange ID:
```bash
ECHANGE_ID="67a1b2c3d4e5f6g7h8i9j0k2"
```

---

### STEP 8: Alice Gets Her Exchanges

```bash
curl -X GET http://localhost:5000/api/echanges \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
      "utilisateurDemandeur": { "firstName": "Bob", ... },
      "utilisateurProprietaire": { "firstName": "Alice", ... },
      "statut": "EN_ATTENTE",
      ...
    }
  ]
}
```

---

### STEP 9: Alice Accepts the Exchange

```bash
curl -X PUT http://localhost:5000/api/echanges/$ECHANGE_ID/accept \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Échange accepté",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "statut": "ACCEPTE",
    ...
  }
}
```

---

### STEP 10: Bob Sends a Message

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "echangeId": "'$ECHANGE_ID'",
    "contenu": "Excellent! Quand pouvons-nous nous rencontrer? Jeudi à 14h00 vous convient?"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Message envoyé",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k3",
    "echangeId": "67a1b2c3d4e5f6g7h8i9j0k2",
    "expediteur": { "firstName": "Bob", ... },
    "contenu": "Excellent! Quand pouvons-nous...",
    "createdAt": "2026-03-25T09:38:35.000Z"
  }
}
```

---

### STEP 11: Alice Gets Messages

```bash
curl -X GET http://localhost:5000/api/messages/$ECHANGE_ID \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k3",
      "echangeId": "67a1b2c3d4e5f6g7h8i9j0k2",
      "expediteur": { "firstName": "Bob", "lastName": "Dupont", ... },
      "contenu": "Excellent! Quand pouvons-nous...",
      "createdAt": "2026-03-25T09:38:35.000Z"
    }
  ]
}
```

---

### STEP 12: Bob Gets Notifications

```bash
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer $BOB_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k4",
      "user": "...",
      "type": "ECHANGE_ACCEPTED",
      "contenu": "Votre demande d'échange a été acceptée",
      "read": false,
      "relatedEchange": "67a1b2c3d4e5f6g7h8i9j0k2",
      "createdAt": "2026-03-25T09:38:35.000Z"
    },
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k5",
      "user": "...",
      "type": "MESSAGE",
      "contenu": "Nouveau message reçu",
      "read": false,
      "relatedEchange": "67a1b2c3d4e5f6g7h8i9j0k2",
      "relatedMessage": "67a1b2c3d4e5f6g7h8i9j0k3",
      "createdAt": "2026-03-25T09:38:35.000Z"
    }
  ]
}
```

---

### STEP 13: Mark Notification as Read

```bash
curl -X PUT http://localhost:5000/api/notifications/67a1b2c3d4e5f6g7h8i9j0k5/read \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Notification marquée comme lue",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k5",
    "read": true,
    ...
  }
}
```

---

### STEP 14: Alice Completes the Exchange

```bash
curl -X PUT http://localhost:5000/api/echanges/$ECHANGE_ID/complete \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Échange finalisé",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "statut": "TERMINE",
    ...
  }
}
```

---

### STEP 15: Get Exchange History

```bash
curl -X GET http://localhost:5000/api/echanges/history \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "ongoing": [],
    "completed": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
        "statut": "TERMINE",
        ...
      }
    ]
  }
}
```

---

## WebSocket Testing with JavaScript

Create a file `test-socket.js`:

```javascript
const io = require('socket.io-client');

const ALICE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const BOB_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const ECHANGE_ID = '67a1b2c3d4e5f6g7h8i9j0k2';

// Alice connects
const aliceSocket = io('http://localhost:5000', {
  auth: { token: ALICE_TOKEN }
});

aliceSocket.on('connect', () => {
  console.log('[Alice] Connected to WebSocket');
  aliceSocket.emit('join_echange', { echangeId: ECHANGE_ID }, (err) => {
    if (err) console.error('[Alice] Error joining:', err);
    else console.log('[Alice] Joined exchange room');
  });
});

aliceSocket.on('receive_message', (data) => {
  console.log('[Alice] Received message:', data.contenu);
});

aliceSocket.on('user_joined', (data) => {
  console.log('[Alice]', data.message);
});

aliceSocket.on('notification', (data) => {
  console.log('[Alice] Notification:', data.type, '-', data.contenu);
});

// Bob connects
setTimeout(() => {
  const bobSocket = io('http://localhost:5000', {
    auth: { token: BOB_TOKEN }
  });

  bobSocket.on('connect', () => {
    console.log('[Bob] Connected to WebSocket');
    bobSocket.emit('join_echange', { echangeId: ECHANGE_ID }, (err) => {
      if (err) console.error('[Bob] Error joining:', err);
      else console.log('[Bob] Joined exchange room');

      // Send a message
      setTimeout(() => {
        bobSocket.emit('send_message',
          { echangeId: ECHANGE_ID, contenu: 'Salut Alice! Comment ça va?' },
          (err, messageId) => {
            if (err) console.error('[Bob] Error sending:', err);
            else console.log('[Bob] Message sent:', messageId);
          }
        );
      }, 1000);
    });
  });

  bobSocket.on('receive_message', (data) => {
    console.log('[Bob] Received message:', data.contenu);
  });

  bobSocket.on('user_joined', (data) => {
    console.log('[Bob]', data.message);
  });

  bobSocket.on('notification', (data) => {
    console.log('[Bob] Notification:', data.type, '-', data.contenu);
  });

  // Close connections after 5 seconds
  setTimeout(() => {
    aliceSocket.disconnect();
    bobSocket.disconnect();
    process.exit(0);
  }, 5000);
}, 1000);
```

Run the test:
```bash
node test-socket.js
```

---

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "CCarré Sprint 3",
    "description": "Sprint 3 Endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Exchanges",
      "item": [
        {
          "name": "Create Exchange",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{ALICE_TOKEN}}"}],
            "url": {"raw": "http://localhost:5000/api/echanges", "protocol": "http", "host": ["localhost"], "port": ["5000"], "path": ["api", "echanges"]},
            "body": {"mode": "raw", "raw": "{\"annonceId\": \"{{ANNONCE_ID}}\", \"messageInitial\": \"Interested!\"}"}
          }
        },
        {
          "name": "Get Exchanges",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{ALICE_TOKEN}}"}],
            "url": {"raw": "http://localhost:5000/api/echanges", "protocol": "http", "host": ["localhost"], "port": ["5000"], "path": ["api", "echanges"]}
          }
        }
      ]
    },
    {
      "name": "Messages",
      "item": [
        {
          "name": "Send Message",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{BOB_TOKEN}}"}],
            "url": {"raw": "http://localhost:5000/api/messages", "protocol": "http", "host": ["localhost"], "port": ["5000"], "path": ["api", "messages"]},
            "body": {"mode": "raw", "raw": "{\"echangeId\": \"{{ECHANGE_ID}}\", \"contenu\": \"Hello!\"}"}
          }
        },
        {
          "name": "Get Messages",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{ALICE_TOKEN}}"}],
            "url": {"raw": "http://localhost:5000/api/messages/{{ECHANGE_ID}}", "protocol": "http", "host": ["localhost"], "port": ["5000"], "path": ["api", "messages", "{{ECHANGE_ID}}"]}
          }
        }
      ]
    }
  ]
}
```

---

## Error Scenarios to Test

### ✅ Test: User cannot create exchange on own annonce
```bash
curl -X POST http://localhost:5000/api/echanges \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"annonceId": "'$ANNONCE_ID'"}'
```
Expected: `400 - Vous ne pouvez pas créer un échange sur votre propre annonce`

### ✅ Test: Non-owner cannot accept exchange
```bash
curl -X PUT http://localhost:5000/api/echanges/$ECHANGE_ID/accept \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json"
```
Expected: `403 - Vous ne pouvez pas accepter cet échange`

### ✅ Test: Unauthorized access to messages
```bash
# Create another user and try to access messages
curl -X GET http://localhost:5000/api/messages/$ECHANGE_ID \
  -H "Authorization: Bearer $CHARLIE_TOKEN"
```
Expected: `403 - Vous n'avez pas accès aux messages de cet échange`

---

## Health Check

```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "CCarré API is running",
  "environment": "development",
  "timestamp": "2026-03-25T09:38:35.000Z"
}
```

---

## Database Verification

Check MongoDB directly:

```bash
# Connect to MongoDB
mongosh

# Use the database
use ccarre

# View collections
show collections

# Check exchanges
db.echanges.find().pretty()

# Check messages
db.messages.find().pretty()

# Check notifications
db.notifications.find().pretty()

# Check user favorites
db.users.find({ "favorites": { $exists: true, $ne: [] } }).pretty()
```

---

## Performance Notes

- Indexes are created for fast queries
- Messages are paginated in the future (implement limit/skip)
- Socket.io rooms prevent broadcasting to all users
- Notifications are created async (non-blocking)

