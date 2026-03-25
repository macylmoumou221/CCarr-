# CCarré – Sprint 3 Implementation Guide

## Overview

Sprint 3 adds the following features to the CCarré backend:

1. **Exchanges (Échanges)** – Create and manage exchange requests
2. **Messaging System** – Send and retrieve messages within exchanges
3. **WebSocket (Real-time)** – Real-time messaging and notifications via Socket.io
4. **Notifications** – User notifications for exchanges and messages
5. **Favorites System** – Add/remove annonces to favorites
6. **Exchange History** – View ongoing and completed exchanges

---

## Architecture Overview

### Models
- `Echange` – Exchange requests between users
- `Message` – Messages in exchanges
- `Notification` – User notifications
- `User` (updated) – Added `favorites` array

### Controllers
- `echange.controller.ts` – Exchange logic
- `message.controller.ts` – Messaging logic
- `notification.controller.ts` – Notification management
- `favorite.controller.ts` – Favorites management

### Routes
- `/api/echanges` – Exchange endpoints
- `/api/messages` – Messaging endpoints
- `/api/notifications` – Notification endpoints
- `/api/favorites` – Favorites endpoints

### WebSocket (Socket.io)
- `src/config/socket.ts` – Real-time messaging and notifications

---

## API Endpoints

### Authentication
All endpoints (except health check) require JWT in header: `Authorization: Bearer <token>`

---

## 1. EXCHANGES (ÉCHANGES)

### POST `/api/echanges`
**Create a new exchange request**

```bash
curl -X POST http://localhost:5000/api/echanges \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "annonceId": "67a1b2c3d4e5f6g7h8i9j0k1",
    "messageInitial": "Bonjour, je suis intéressé par cet échange!"
  }'
```

**Request Body:**
```json
{
  "annonceId": "string (ObjectId)",
  "messageInitial": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Demande d'échange créée avec succès",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "utilisateurDemandeur": { "firstName": "...", "lastName": "...", "email": "..." },
    "utilisateurProprietaire": { "firstName": "...", "lastName": "...", "email": "..." },
    "annonce": { "_id": "...", "title": "..." },
    "statut": "EN_ATTENTE",
    "messageInitial": "Bonjour...",
    "createdAt": "2026-03-25T09:38:35.000Z",
    "updatedAt": "2026-03-25T09:38:35.000Z"
  }
}
```

---

### GET `/api/echanges`
**Get all exchanges for the current user**

```bash
curl -X GET "http://localhost:5000/api/echanges?statut=EN_ATTENTE" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**
- `statut`: Filter by status (`EN_ATTENTE`, `ACCEPTE`, `TERMINE`, `REFUSE`)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "utilisateurDemandeur": {...},
      "utilisateurProprietaire": {...},
      "annonce": {...},
      "statut": "EN_ATTENTE",
      "messageInitial": "...",
      "createdAt": "2026-03-25T09:38:35.000Z",
      "updatedAt": "2026-03-25T09:38:35.000Z"
    }
  ]
}
```

---

### PUT `/api/echanges/:id/accept`
**Accept an exchange request (owner only)**

```bash
curl -X PUT http://localhost:5000/api/echanges/67a1b2c3d4e5f6g7h8i9j0k1/accept \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Échange accepté",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "utilisateurDemandeur": {...},
    "utilisateurProprietaire": {...},
    "annonce": {...},
    "statut": "ACCEPTE",
    "createdAt": "2026-03-25T09:38:35.000Z",
    "updatedAt": "2026-03-25T09:38:35.000Z"
  }
}
```

---

### PUT `/api/echanges/:id/refuse`
**Refuse an exchange request (owner only)**

```bash
curl -X PUT http://localhost:5000/api/echanges/67a1b2c3d4e5f6g7h8i9j0k1/refuse \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Échange refusé",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "statut": "REFUSE",
    ...
  }
}
```

---

### PUT `/api/echanges/:id/complete`
**Complete an exchange (both users can finalize)**

```bash
curl -X PUT http://localhost:5000/api/echanges/67a1b2c3d4e5f6g7h8i9j0k1/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Échange finalisé",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "statut": "TERMINE",
    ...
  }
}
```

---

### GET `/api/echanges/history`
**Get exchange history (ongoing + completed)**

```bash
curl -X GET http://localhost:5000/api/echanges/history \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ongoing": [
      { "_id": "...", "statut": "EN_ATTENTE", ... },
      { "_id": "...", "statut": "ACCEPTE", ... }
    ],
    "completed": [
      { "_id": "...", "statut": "TERMINE", ... }
    ]
  }
}
```

---

## 2. MESSAGING

### POST `/api/messages`
**Send a message in an exchange**

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "echangeId": "67a1b2c3d4e5f6g7h8i9j0k1",
    "contenu": "Excellent! Quand voulez-vous faire l'échange?"
  }'
```

**Request Body:**
```json
{
  "echangeId": "string (ObjectId)",
  "contenu": "string (required, 1-5000 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message envoyé",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "echangeId": "67a1b2c3d4e5f6g7h8i9j0k1",
    "expediteur": { "_id": "...", "firstName": "...", "lastName": "..." },
    "contenu": "Excellent!...",
    "createdAt": "2026-03-25T09:38:35.000Z",
    "updatedAt": "2026-03-25T09:38:35.000Z"
  }
}
```

---

### GET `/api/messages/:echangeId`
**Get all messages for an exchange**

```bash
curl -X GET http://localhost:5000/api/messages/67a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "echangeId": "67a1b2c3d4e5f6g7h8i9j0k1",
      "expediteur": { "_id": "...", "firstName": "...", "lastName": "..." },
      "contenu": "Message 1",
      "createdAt": "2026-03-25T09:38:35.000Z"
    },
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
      "echangeId": "67a1b2c3d4e5f6g7h8i9j0k1",
      "expediteur": { "_id": "...", "firstName": "...", "lastName": "..." },
      "contenu": "Message 2",
      "createdAt": "2026-03-25T09:38:40.000Z"
    }
  ]
}
```

---

## 3. NOTIFICATIONS

### GET `/api/notifications`
**Get all notifications for the current user**

```bash
curl -X GET "http://localhost:5000/api/notifications?unreadOnly=true" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**
- `unreadOnly`: Filter unread only (`true`/`false`)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "user": "67a1b2c3d4e5f6g7h8i9j0k1",
      "type": "ECHANGE_REQUEST",
      "contenu": "Une demande d'échange a été reçue...",
      "read": false,
      "relatedEchange": "67a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2026-03-25T09:38:35.000Z"
    },
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
      "user": "67a1b2c3d4e5f6g7h8i9j0k1",
      "type": "MESSAGE",
      "contenu": "Nouveau message reçu",
      "read": false,
      "relatedEchange": "67a1b2c3d4e5f6g7h8i9j0k1",
      "relatedMessage": "67a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2026-03-25T09:38:40.000Z"
    }
  ]
}
```

---

### PUT `/api/notifications/:id/read`
**Mark a notification as read**

```bash
curl -X PUT http://localhost:5000/api/notifications/67a1b2c3d4e5f6g7h8i9j0k1/read \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marquée comme lue",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "user": "67a1b2c3d4e5f6g7h8i9j0k1",
    "type": "ECHANGE_REQUEST",
    "read": true,
    ...
  }
}
```

---

### PUT `/api/notifications/read-all`
**Mark all notifications as read**

```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Toutes les notifications ont été marquées comme lues"
}
```

---

## 4. FAVORITES

### POST `/api/favorites/:annonceId`
**Add an annonce to favorites**

```bash
curl -X POST http://localhost:5000/api/favorites/67a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Annonce ajoutée aux favoris",
  "data": [
    "67a1b2c3d4e5f6g7h8i9j0k1",
    "67a1b2c3d4e5f6g7h8i9j0k2"
  ]
}
```

---

### DELETE `/api/favorites/:annonceId`
**Remove an annonce from favorites**

```bash
curl -X DELETE http://localhost:5000/api/favorites/67a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Annonce retirée des favoris",
  "data": [
    "67a1b2c3d4e5f6g7h8i9j0k2"
  ]
}
```

---

### GET `/api/favorites`
**Get all favorite annonces**

```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "title": "MacBook Pro 14\"",
      "description": "Excellent état...",
      "type": "vente",
      "status": "disponible",
      "images": ["https://..."],
      "price": 1200,
      "owner": "67a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2026-03-25T09:38:35.000Z"
    }
  ]
}
```

---

## 5. WEBSOCKET (REAL-TIME MESSAGING) – Socket.io

### Connection

**Connect to WebSocket:**

```javascript
import io from 'socket.io-client';

const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', {
  auth: {
    token: token
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('error', (error) => {
  console.error('Connection error:', error);
});
```

---

### Events

#### Join Exchange (Client → Server)

```javascript
socket.emit('join_echange', 
  { echangeId: '67a1b2c3d4e5f6g7h8i9j0k1' },
  (err) => {
    if (err) console.error('Error joining:', err);
    else console.log('Successfully joined exchange room');
  }
);
```

---

#### Send Message (Client → Server)

```javascript
socket.emit('send_message',
  {
    echangeId: '67a1b2c3d4e5f6g7h8i9j0k1',
    contenu: 'Hello! How are you?'
  },
  (err, messageId) => {
    if (err) console.error('Error sending message:', err);
    else console.log('Message sent:', messageId);
  }
);
```

---

#### Receive Message (Server → Client)

```javascript
socket.on('receive_message', (data) => {
  console.log('New message received:', {
    _id: data._id,
    echangeId: data.echangeId,
    expediteur: data.expediteur,
    contenu: data.contenu,
    createdAt: data.createdAt
  });
});
```

---

#### User Joined (Server → Client)

```javascript
socket.on('user_joined', (data) => {
  console.log(`${data.userId} has joined the exchange room`);
  console.log(data.message); // "Utilisateur connecté"
});
```

---

#### User Left (Server → Client)

```javascript
socket.on('user_left', (data) => {
  console.log(`${data.userId} has left the exchange room`);
  console.log(data.message); // "Utilisateur déconnecté"
});
```

---

#### Real-time Notification (Server → Client)

```javascript
socket.on('notification', (data) => {
  console.log('New notification:', {
    type: data.type, // MESSAGE, ECHANGE_REQUEST, ECHANGE_ACCEPTED, etc.
    contenu: data.contenu,
    echangeId: data.echangeId
  });
});
```

---

#### Leave Exchange (Client → Server)

```javascript
socket.emit('leave_echange', {
  echangeId: '67a1b2c3d4e5f6g7h8i9j0k1'
});
```

---

#### Disconnect (Client → Server)

```javascript
socket.disconnect();
```

---

## Complete WebSocket Example (React)

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function ExchangeChat({ echangeId, token }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected');
      // Join the exchange room
      newSocket.emit('join_echange', { echangeId });
    });

    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on('user_joined', (data) => {
      console.log(data.message);
    });

    newSocket.on('notification', (data) => {
      console.log('Notification:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [echangeId, token]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    socket?.emit('send_message',
      { echangeId, contenu: inputValue },
      (err, messageId) => {
        if (!err) {
          setInputValue('');
        } else {
          console.error('Error sending message:', err);
        }
      }
    );
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <strong>{msg.expediteur.firstName}</strong>: {msg.contenu}
          </div>
        ))}
      </div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
```

---

## Testing with cURL

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

### 2. Confirm Email
```bash
curl -X POST http://localhost:5000/api/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@etu.univ-amu.fr",
    "code": "12345678"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@etu.univ-amu.fr",
    "password": "Password123!"
  }'
```

### 4. Create an Annonce
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 14\"",
    "description": "Excellent condition, barely used",
    "type": "vente",
    "category": "Informatique",
    "price": 1200
  }'
```

### 5. Create an Exchange
```bash
curl -X POST http://localhost:5000/api/echanges \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "annonceId": "<annonce_id>",
    "messageInitial": "I'm interested in this exchange!"
  }'
```

### 6. Accept Exchange
```bash
curl -X PUT http://localhost:5000/api/echanges/<exchange_id>/accept \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### 7. Send Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "echangeId": "<exchange_id>",
    "contenu": "Great! When can we meet?"
  }'
```

### 8. Get Notifications
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>"
```

### 9. Add to Favorites
```bash
curl -X POST http://localhost:5000/api/favorites/<annonce_id> \
  -H "Authorization: Bearer <token>"
```

### 10. Get Favorites
```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>"
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Utilisateur non authentifié"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Vous ne pouvez pas effectuer cette action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "La ressource n'existe pas"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Données invalides"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Notification Types

```typescript
enum NotificationType {
  MESSAGE = 'MESSAGE',
  ECHANGE_REQUEST = 'ECHANGE_REQUEST',
  ECHANGE_ACCEPTED = 'ECHANGE_ACCEPTED',
  ECHANGE_REFUSED = 'ECHANGE_REFUSED',
  ECHANGE_COMPLETED = 'ECHANGE_COMPLETED'
}
```

---

## Exchange Statuses

```typescript
enum EchangeStatus {
  EN_ATTENTE = 'EN_ATTENTE',      // Pending
  ACCEPTE = 'ACCEPTE',             // Accepted
  TERMINE = 'TERMINE',             // Completed
  REFUSE = 'REFUSE'                // Refused
}
```

---

## Rules & Constraints

### Exchanges
- ✅ User must be authenticated
- ✅ A user cannot create an exchange on their own annonce
- ✅ Only the owner can accept/refuse
- ✅ Only involved users can access the exchange
- ✅ Unique constraint: one requester cannot create multiple active exchanges for the same annonce

### Messaging
- ✅ Only users involved in the exchange can send/read messages
- ✅ Messages are saved to MongoDB and emitted in real-time
- ✅ No duplicate messages (message is saved before emitting)

### Notifications
- ✅ Notifications are created automatically for relevant events
- ✅ Users can mark notifications as read
- ✅ Unread notifications can be filtered

### Favorites
- ✅ Users can add/remove annonces to/from favorites
- ✅ Duplicate favorites are prevented
- ✅ Favorites are populated with full annonce data

---

## WebSocket Security

- ✅ Authentication via JWT in handshake
- ✅ User identification verified before joining rooms
- ✅ Only authorized users can access exchange messages
- ✅ Rooms are scoped by `echange_${echangeId}`

---

## Database Indexes

```typescript
// Echange
echangeSchema.index({ utilisateurDemandeur: 1 });
echangeSchema.index({ utilisateurProprietaire: 1 });
echangeSchema.index({ annonce: 1 });
echangeSchema.index({ statut: 1 });
echangeSchema.index({ createdAt: -1 });
echangeSchema.index({ utilisateurDemandeur: 1, utilisateurProprietaire: 1, annonce: 1 }, { unique: true });

// Message
messageSchema.index({ echangeId: 1, createdAt: 1 });
messageSchema.index({ expediteur: 1 });
messageSchema.index({ createdAt: -1 });

// Notification
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ relatedEchange: 1 });
```

---

## Next Steps

1. **Testing** – Use cURL or Postman to test all endpoints
2. **Frontend Integration** – Integrate Socket.io in your React/Vue app
3. **Deployment** – Deploy to production with proper CORS origins
4. **Monitoring** – Monitor Socket.io connections and message volume

