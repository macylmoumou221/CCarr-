# CCarré Sprint 3 – Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                           │
│  (React/Vue with Socket.io Client Library)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP │ WebSocket
                    REST │ (Socket.io)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     EXPRESS SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│  ▶ app.ts (HTTP Server + WebSocket Server)                      │
│  ▶ Middleware (Auth, CORS, Helmet, Error handling)              │
│  ▶ Routes (13 REST endpoints)                                   │
│  ▶ Socket.io (Real-time events)                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   MongoDB (Local)        │  │   Socket.io Room System  │
│  ▶ Users                 │  │  ▶ echange_{id}          │
│  ▶ Annonces              │  │  ▶ user_{userId}         │
│  ▶ Echanges              │  │  ▶ Events & Broadcasts   │
│  ▶ Messages              │  │                          │
│  ▶ Notifications         │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

---

## REST API Layer

```
┌─ Controllers Layer ───────────────────────────────────────────┐
│                                                                │
│  ▸ echange.controller.ts      (6 functions)                  │
│    - createEchange()                                          │
│    - getUserEchanges()                                        │
│    - acceptEchange()                                          │
│    - refuseEchange()                                          │
│    - completeEchange()                                        │
│    - getExchangeHistory()                                     │
│                                                                │
│  ▸ message.controller.ts      (2 functions)                  │
│    - sendMessage()                                            │
│    - getMessagesByEchange()                                   │
│                                                                │
│  ▸ notification.controller.ts (3 functions)                  │
│    - getUserNotifications()                                   │
│    - markAsRead()                                             │
│    - markAllAsRead()                                          │
│                                                                │
│  ▸ favorite.controller.ts     (3 functions)                  │
│    - addFavorite()                                            │
│    - removeFavorite()                                         │
│    - getFavorites()                                           │
│                                                                │
└─ Routes Layer ────────────────────────────────────────────────┘
│                                                                │
│  ▸ echange.routes.ts      → /api/echanges/*                  │
│  ▸ message.routes.ts      → /api/messages/*                  │
│  ▸ notification.routes.ts → /api/notifications/*             │
│  ▸ favorite.routes.ts     → /api/favorites/*                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Models

```
┌────────────────────────────────────────────────────────────────┐
│                      MONGODB DOCUMENTS                          │
├────────────────────────────────────────────────────────────────┤

User (existing + updated)
├─ _id: ObjectId
├─ firstName: String
├─ lastName: String
├─ email: String (unique)
├─ password: String (hashed)
├─ isVerified: Boolean
├─ favorites: ObjectId[] ← NEW FIELD
└─ timestamps

Echange (NEW)
├─ _id: ObjectId
├─ utilisateurDemandeur: ObjectId (ref: User)
├─ utilisateurProprietaire: ObjectId (ref: User)
├─ annonce: ObjectId (ref: Annonce)
├─ statut: Enum [EN_ATTENTE, ACCEPTE, REFUSE, TERMINE]
├─ messageInitial: String
└─ timestamps

Message (NEW)
├─ _id: ObjectId
├─ echangeId: ObjectId (ref: Echange)
├─ expediteur: ObjectId (ref: User)
├─ contenu: String
└─ timestamps

Notification (NEW)
├─ _id: ObjectId
├─ user: ObjectId (ref: User)
├─ type: Enum [MESSAGE, ECHANGE_REQUEST, ECHANGE_ACCEPTED, ...]
├─ contenu: String
├─ read: Boolean
├─ relatedEchange: ObjectId (ref: Echange)
├─ relatedMessage: ObjectId (ref: Message)
└─ timestamps

Annonce (existing – unchanged)
├─ _id: ObjectId
├─ title: String
├─ description: String
├─ type: Enum [vente, echange, pret, demandePret]
├─ owner: ObjectId (ref: User)
├─ images: String[]
├─ price: Number
└─ timestamps

└────────────────────────────────────────────────────────────────┘
```

---

## WebSocket Event Flow

```
CLIENT (Browser)                    SERVER (Socket.io)              DATABASE
    │                                       │                           │
    │ 1. Connection with JWT                │                           │
    ├──────────────────────────────────────►│                           │
    │                                       │ Verify Token              │
    │                                       │ Get User from DB          │
    │                                       ├──────────────────────────►│
    │                                       │◄──────────────────────────┤
    │ 2. join_echange                       │                           │
    ├──────────────────────────────────────►│                           │
    │                                       │ Verify User in Exchange   │
    │                                       │ Join Room: echange_{id}   │
    │                                       │                           │
    │ 3. send_message                       │                           │
    ├──────────────────────────────────────►│                           │
    │                                       │ Save Message to DB        │
    │                                       ├──────────────────────────►│
    │                                       │◄──────────────────────────┤
    │                                       │ Broadcast to Room         │
    │ 4. receive_message (broadcast)        │                           │
    │◄──────────────────────────────────────┤                           │
    │                                       │ Create Notification       │
    │                                       ├──────────────────────────►│
    │                                       │                           │
    │ 5. notification (to other user)       │                           │
    │                                       │ Emit: user_{userId}       │
    │                                       │                           │
    │ 6. Disconnect                         │                           │
    ├──────────────────────────────────────►│                           │
    │                                       │ Leave Room                │
    │                                       │ Broadcast: user_left      │
```

---

## Exchange Workflow Diagram

```
START
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ Bob: POST /api/echanges                                 │
│ Create exchange request on Alice's annonce              │
└─────────────────────────────────────────────────────────┘
  │
  ├──► Echange created with status: EN_ATTENTE
  │
  └──► Notification created: "Exchange request received"
        └─► Sent to Alice
            └─► Stored in DB
                └─► Emitted via Socket.io (real-time)
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ Alice: GET /api/echanges                                │
│ View pending exchange requests                          │
└─────────────────────────────────────────────────────────┘
  │
  ▼
  ┌──────────────────────────────┐
  │ Alice accepts or refuses?    │
  └──────────────────────────────┘
  │                              │
  │ Accept                       Refuse
  │   │                           │
  │   ▼                           ▼
  │ PUT /accept              PUT /refuse
  │   │                           │
  │   ├─► Status = ACCEPTE       └─► Status = REFUSE
  │   │                               │
  │   └─► Notification: "Accepted"    └─► Notification: "Refused"
  │       └─► To Bob                      └─► To Bob
  │           └─► Real-time (Socket.io)      └─► Real-time
  │
  ▼ (After Accept)
┌─────────────────────────────────────────────────────────┐
│ Socket.io: Real-time Messaging                          │
│ Bob & Alice join exchange room: echange_{exchangeId}    │
│ They exchange messages in real-time                     │
└─────────────────────────────────────────────────────────┘
  │
  │ Each message:
  │ 1. Saved to MongoDB
  │ 2. Emitted to room members (real-time)
  │ 3. Notification created for other user
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ Either user: PUT /api/echanges/:id/complete            │
│ Mark exchange as completed                              │
└─────────────────────────────────────────────────────────┘
  │
  ├─► Status = TERMINE
  │
  └─► Notification: "Exchange completed"
      └─► To other user
          └─► Real-time
END
```

---

## Authentication & Authorization Flow

```
REQUEST → Express App
  │
  ▼
┌──────────────────────────────┐
│ Extract JWT from Header      │
│ Authorization: Bearer <token>│
└──────────────────────────────┘
  │
  ▼ (if missing/invalid)
❌ 401 Unauthorized
  │
  ▼ (if valid)
┌──────────────────────────────┐
│ authMiddleware               │
│ ▸ Decode JWT                 │
│ ▸ Verify signature           │
│ ▸ Check expiration           │
│ ▸ Verify user exists         │
└──────────────────────────────┘
  │
  ▼ (if invalid)
❌ 401 Token Invalid
  │
  ▼ (if valid)
┌──────────────────────────────┐
│ req.user = { userId, email } │
│ Continue to route handler    │
└──────────────────────────────┘
  │
  ▼
┌──────────────────────────────┐
│ Authorization Checks         │
│ ▸ Can modify own data?       │
│ ▸ Can access resource?       │
│ ▸ Is owner/involved user?    │
└──────────────────────────────┘
  │
  ├─► YES ✅ → Execute action
  │
  └─► NO ❌ → 403 Forbidden
```

---

## Real-time Notification Flow

```
ACTION (e.g., Exchange request created)
  │
  ▼
┌───────────────────────────────────────────────────────────┐
│ Controller Function                                        │
│ ▸ Create Echange in MongoDB                               │
│ ▸ Call: Notification.create({...})                        │
│   - user: Alice's ID                                      │
│   - type: ECHANGE_REQUEST                                 │
│   - contenu: "Exchange request received"                  │
│   - relatedEchange: Echange ID                            │
└───────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────┐
│ Notification Saved to Database                            │
│ ▸ _id created                                             │
│ ▸ read = false                                            │
│ ▸ createdAt = now                                         │
└───────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────┐
│ Socket.io Emit (if Alice is connected)                    │
│ io.to('user_AliceId').emit('notification', {              │
│   type: 'ECHANGE_REQUEST',                                │
│   contenu: 'Exchange request received',                   │
│   echangeId: '...'                                        │
│ })                                                         │
└───────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────┐
│ Client receives real-time notification                    │
│ ▸ Shows toast/alert                                       │
│ ▸ Increments unread count                                 │
│ ▸ Refreshes notifications list (optional)                 │
│                                                            │
│ Later: Alice can query GET /api/notifications             │
│        to see all notifications (real + historical)       │
└───────────────────────────────────────────────────────────┘
```

---

## Message Delivery & Persistence

```
Bob sends message via Socket.io
  │
  ▼
┌──────────────────────────────────────────────────────────┐
│ Event handler: 'send_message'                            │
│ ▸ Validate: exchangeId, contenu                          │
│ ▸ Verify: User in exchange                               │
│ ▸ Check: Exchange is ACCEPTE                             │
└──────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────┐
│ Save to MongoDB First (CRITICAL)                         │
│ Message.create({                                         │
│   echangeId,                                             │
│   expediteur: Bob's ID,                                  │
│   contenu: "Hello Alice!"                                │
│ })                                                        │
│                                                           │
│ Result: Message with _id saved                           │
└──────────────────────────────────────────────────────────┘
  │
  ▼ (THEN emit – never emit before saving)
┌──────────────────────────────────────────────────────────┐
│ Emit to room: echange_exchangeId                         │
│ io.to('echange_exchangeId').emit('receive_message', {    │
│   _id: message._id,     ← Now we have the saved _id       │
│   echangeId,                                             │
│   expediteur: { name, email, ... },                      │
│   contenu: "Hello Alice!",                               │
│   createdAt: now                                         │
│ })                                                        │
└──────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────┐
│ Both Bob & Alice receive message real-time               │
│ No duplicates (DB has 1 copy, emit has full data)        │
└──────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────┐
│ Create Notification for Alice                            │
│ Notification.create({                                    │
│   user: Alice,                                           │
│   type: MESSAGE,                                         │
│   contenu: "Nouveau message reçu",                       │
│   relatedMessage: message._id                            │
│ })                                                        │
└──────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────┐
│ Emit notification to Alice                               │
│ io.to('user_AliceId').emit('notification', {             │
│   type: MESSAGE,                                         │
│   contenu: "Nouveau message reçu",                       │
│   echangeId: exchangeId                                  │
│ })                                                        │
└──────────────────────────────────────────────────────────┘

RESULT: Message is:
✅ Persisted in DB
✅ Delivered real-time via Socket.io
✅ Has unique _id (no duplicates)
✅ Generates notification
✅ Notification is real-time + retrievable via REST
```

---

## Database Indexes Strategy

```
Echange Collection
├─ { utilisateurDemandeur: 1 }
│  └─ Fast lookup: exchanges initiated by user
│
├─ { utilisateurProprietaire: 1 }
│  └─ Fast lookup: exchanges on user's annonces
│
├─ { annonce: 1 }
│  └─ Fast lookup: all exchanges for an annonce
│
├─ { statut: 1 }
│  └─ Fast filtering: by status (EN_ATTENTE, etc)
│
├─ { createdAt: -1 }
│  └─ Fast sorting: newest first
│
└─ { utilisateurDemandeur: 1, utilisateurProprietaire: 1, annonce: 1 } UNIQUE
   └─ Prevents duplicates: same requester can't create 2 exchanges per annonce

Message Collection
├─ { echangeId: 1, createdAt: 1 }
│  └─ Fast retrieval: all messages for exchange in order
│
├─ { expediteur: 1 }
│  └─ Fast lookup: messages by sender
│
└─ { createdAt: -1 }
   └─ Fast sorting: newest first

Notification Collection
├─ { user: 1, createdAt: -1 }
│  └─ Fast retrieval: user's notifications, newest first
│
├─ { user: 1, read: 1 }
│  └─ Fast filtering: unread notifications
│
└─ { relatedEchange: 1 }
   └─ Fast lookup: notifications for exchange
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: HTTPS / TLS (Production)                      │
│ All communication encrypted                            │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: CORS                                          │
│ Only allowed origins can access API                    │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: JWT Authentication                           │
│ Request must include valid Bearer token               │
│ Token verified and user ID extracted                  │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Authorization Checks                         │
│ ✓ Can only modify own data                            │
│ ✓ Only owner can accept/refuse exchanges              │
│ ✓ Only involved users see messages                    │
│ ✓ Unique constraints prevent duplicates               │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Layer 5: Input Validation                             │
│ ✓ Mongoose schema validation                          │
│ ✓ String length limits                                │
│ ✓ Enum validation                                     │
│ ✓ Required field checks                               │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Layer 6: Database Security                            │
│ ✓ Passwords hashed with bcrypt                        │
│ ✓ Indexes for performance                             │
│ ✓ Referential integrity (ObjectIds)                   │
└────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
API Response Times (Estimated)

GET /api/echanges                 ← 50-150ms (indexed)
GET /api/messages/:echangeId      ← 50-200ms (indexed + sorted)
GET /api/notifications            ← 50-100ms (indexed)
GET /api/favorites                ← 100-200ms (needs populate)
POST /api/echanges                ← 150-300ms (includes notification creation)
POST /api/messages                ← 100-250ms (save + socket emit)
Socket.io message delivery        ← <50ms (in-memory)

Optimizations Applied:
✓ Database indexes on all query fields
✓ Socket.io rooms prevent global broadcasts
✓ Lean queries where possible
✓ Async notification creation (non-blocking)
✓ Proper HTTP caching headers
✓ Connection pooling (Mongoose default)
```

---

## Deployment Architecture

```
Production Environment
┌──────────────────────────────────────────────────────┐
│                    LOAD BALANCER                      │
│                   (e.g., nginx)                       │
└───────────────────┬──────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│  Server 1        │   │  Server 2        │
│  Port 5000       │   │  Port 5001       │
│  (Node.js)       │   │  (Node.js)       │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │  MongoDB Cluster     │
         │  (replicated)        │
         │  (sharded if needed) │
         └──────────────────────┘

Socket.io Considerations:
- Use Redis adapter for session persistence
- Enable sticky sessions on load balancer
- Configure CORS for production domain
- Use secure WebSocket (WSS)
```

---

This architecture ensures:
✅ Scalability
✅ Real-time responsiveness  
✅ Data persistence
✅ Security
✅ Performance

