# API Endpoints - Request Bodies

## Authentication Endpoints

### 1. POST /api/auth/register
**Description:** Create a new user account

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@etu.univ-amu.fr",
  "password": "SecurePassword123!"
}
```

**Required Fields:**
- `firstName` (string) - Min 2 chars, max 50 chars
- `lastName` (string) - Min 2 chars, max 50 chars
- `email` (string) - Must end with @etu.univ-amu.fr
- `password` (string) - Min 8 chars

**Response (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé. Vérifiez votre email pour le code de confirmation",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@etu.univ-amu.fr",
      "isVerified": false
    }
  }
}
```

---

### 2. POST /api/auth/confirm
**Description:** Verify email with 8-digit confirmation code

**Request Body:**
```json
{
  "email": "john@etu.univ-amu.fr",
  "code": "12345678"
}
```

**Required Fields:**
- `email` (string) - Must match registration email
- `code` (string) - 8-digit code from email

**Response (200):**
```json
{
  "success": true,
  "message": "Email confirmé avec succès",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Code invalide ou expiré"
}
```

---

### 3. POST /api/auth/resend-confirmation
**Description:** Resend confirmation code to email

**Request Body:**
```json
{
  "email": "john@etu.univ-amu.fr"
}
```

**Required Fields:**
- `email` (string) - Email that needs verification

**Response (200):**
```json
{
  "success": true,
  "message": "Code de confirmation renvoyé à votre email"
}
```

---

### 4. POST /api/auth/login
**Description:** Login with verified account

**Request Body:**
```json
{
  "email": "john@etu.univ-amu.fr",
  "password": "SecurePassword123!"
}
```

**Required Fields:**
- `email` (string)
- `password` (string)

**Response (200):**
```json
{
  "success": true,
  "message": "Connecté avec succès",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@etu.univ-amu.fr"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Identifiants invalides"
}
```

---

### 5. GET /api/auth/me
**Description:** Get current user profile (protected)

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No Request Body**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@etu.univ-amu.fr",
      "isVerified": true,
      "createdAt": "2026-03-13T10:30:00.000Z"
    }
  }
}
```

---

## Annonce Endpoints

### 6. POST /api/annonces
**Description:** Create a new annonce with FormData (supports file uploads)

**Headers Required:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**

#### Type: VENTE (Sale)
```
title: "iPhone 12"
description: "Excellent état, très peu utilisé, avec boîte et accessoires"
type: "vente"
category: "électronique"
price: "350"
images: [file1.jpg, file2.jpg]
```

#### Type: ECHANGE (Exchange)
```
title: "Vélo VTT 2023"
description: "Vélo de montagne peu utilisé, très bon état"
type: "echange"
category: "sports"
exchangeFor: "Un tapis roulant ou home gym"
exchangeImage: [file_wanted.jpg]
images: [file1.jpg, file2.jpg]
```

#### Type: PRET (Loan)
```
title: "Perceuse Bosch"
description: "Perceuse électrique en parfait état de fonctionnement"
type: "pret"
category: "outils"
borrowPeriod: "1 à 2 semaines"
images: [file1.jpg]
```

#### Type: DEMANDE_PRET (Borrow Request)
```
title: "Recherche - Perceuse électrique"
description: "J'ai besoin d'emprunter une perceuse pour un projet pendant le week-end"
type: "demandePret"
category: "outils"
```

**JavaScript Example (FormData):**
```javascript
const formData = new FormData();
formData.append('title', 'iPhone 12');
formData.append('description', 'Excellent état, très peu utilisé');
formData.append('type', 'vente');
formData.append('category', 'électronique');
formData.append('price', '350');

// Add multiple image files
const fileInput = document.querySelector('input[type="file"]');
for (let file of fileInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=iPhone 12" \
  -F "description=Excellent état" \
  -F "type=vente" \
  -F "category=électronique" \
  -F "price=350" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
      "title": "iPhone 12",
      "description": "Excellent état, très peu utilisé",
      "type": "vente",
      "category": "électronique",
      "price": 350,
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ccarre/annonces/abc123.jpg"
      ],
      "owner": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@etu.univ-amu.fr"
      },
      "status": "disponible",
      "createdAt": "2026-03-13T10:30:00.000Z",
      "updatedAt": "2026-03-13T10:30:00.000Z"
    }
  }
}
```

---

### 7. GET /api/annonces
**Description:** Get all annonces (with optional filters)

**Headers Required:**
```
Authorization: Bearer JWT_TOKEN
```

**Query Parameters (Optional):**
```
?type=vente
?category=électronique
?status=disponible
```

**Examples:**
```
GET /api/annonces
GET /api/annonces?type=vente
GET /api/annonces?type=vente&category=électronique
GET /api/annonces?status=disponible
GET /api/annonces?category=livres
```

**No Request Body**

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "annonces": [
      {
        "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
        "title": "iPhone 12",
        "type": "vente",
        "price": 350,
        "images": ["https://res.cloudinary.com/..."],
        "owner": { "_id": "...", "firstName": "John", "lastName": "Doe" },
        "status": "disponible",
        "createdAt": "2026-03-13T10:30:00.000Z"
      },
      {
        "_id": "65b1c2d3e4f5g6h7i8j9k0l2",
        "title": "Vélo VTT",
        "type": "echange",
        "exchangeFor": "Un tapis roulant",
        "exchangeImage": "https://res.cloudinary.com/...",
        "images": ["https://res.cloudinary.com/..."],
        "owner": { "_id": "...", "firstName": "Jane", "lastName": "Smith" },
        "status": "disponible",
        "createdAt": "2026-03-12T15:45:00.000Z"
      }
    ]
  }
}
```

---

### 8. GET /api/annonces/:id
**Description:** Get a specific annonce by ID

**Headers Required:**
```
Authorization: Bearer JWT_TOKEN
```

**No Request Body**

**Example:**
```
GET /api/annonces/65b1c2d3e4f5g6h7i8j9k0l1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "annonce": {
      "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
      "title": "iPhone 12",
      "description": "Excellent état, très peu utilisé",
      "type": "vente",
      "category": "électronique",
      "price": 350,
      "images": ["https://res.cloudinary.com/..."],
      "owner": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@etu.univ-amu.fr"
      },
      "status": "disponible",
      "createdAt": "2026-03-13T10:30:00.000Z",
      "updatedAt": "2026-03-13T10:30:00.000Z"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Annonce introuvable"
}
```

---

### 9. PUT /api/annonces/:id
**Description:** Update an annonce (only owner can update)

**Headers Required:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data (All Optional):**
```
title: "iPhone 12 Pro Max"
description: "Updated description"
category: "électronique"
status: "reserve"
price: "400"
images: [new_file1.jpg, new_file2.jpg]
```

**For Exchange Update:**
```
exchangeFor: "Updated exchange description"
exchangeImage: [new_wanted_image.jpg]
```

**For Loan Update:**
```
borrowPeriod: "3 semaines"
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/annonces/65b1c2d3e4f5g6h7i8j9k0l1 \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=iPhone 12 Pro Max" \
  -F "price=400" \
  -F "status=reserve"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('title', 'iPhone 12 Pro Max');
formData.append('price', '400');
formData.append('status', 'reserve');

const response = await fetch('http://localhost:5000/api/annonces/65b1c2d3e4f5g6h7i8j9k0l1', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Response (200):**
```json
{
  "success": true,
  "message": "Annonce modifiée avec succès",
  "data": {
    "annonce": {
      "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
      "title": "iPhone 12 Pro Max",
      "price": 400,
      "status": "reserve",
      "updatedAt": "2026-03-13T11:45:00.000Z"
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Tu n'es pas autorisé à modifier cette annonce"
}
```

---

### 10. DELETE /api/annonces/:id
**Description:** Delete an annonce (only owner can delete)

**Headers Required:**
```
Authorization: Bearer JWT_TOKEN
```

**No Request Body**

**Example:**
```
DELETE /api/annonces/65b1c2d3e4f5g6h7i8j9k0l1
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/annonces/65b1c2d3e4f5g6h7i8j9k0l1 \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Annonce supprimée avec succès"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Tu n'es pas autorisé à supprimer cette annonce"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Le titre, la description et le type sont obligatoires"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token invalide ou expiré"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Tu n'es pas autorisé à modifier cette annonce"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Annonce introuvable"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Erreur serveur"
}
```

---

## Validation Rules Summary

### Auth Endpoints
| Field | Type | Min | Max | Rules |
|-------|------|-----|-----|-------|
| firstName | string | 2 | 50 | Letters, spaces, hyphens |
| lastName | string | 2 | 50 | Letters, spaces, hyphens |
| email | string | - | - | Must end with @etu.univ-amu.fr |
| password | string | 8 | - | At least 8 characters |
| code | string | 8 | 8 | Exactly 8 digits |

### Annonce Endpoints
| Field | Type | Min | Max | Required If |
|-------|------|-----|-----|------------|
| title | string | 3 | 120 | Always |
| description | string | 10 | 2000 | Always |
| type | enum | - | - | Always (vente, echange, pret, demandePret) |
| category | string | - | 50 | Optional |
| price | number | > 0 | - | type = vente |
| exchangeFor | string | 5 | 500 | type = echange |
| exchangeImage | file | - | 5MB | type = echange (optional but recommended) |
| borrowPeriod | string | 3 | 100 | type = pret |
| images | file array | - | 6 files | Optional (max 5MB each, JPEG/PNG/WebP) |
| status | enum | - | - | Optional (disponible, reserve) |

---

## Authentication Header Format

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

Example with real token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWExYjJjM2Q0ZTVmNmc3aDhpOWowazEiLCJpYXQiOjE3MTU2MzAwMDAsImV4cCI6MTcxNjIzNDgwMH0.abcdef123456...
```

**Get JWT token from:**
- `POST /api/auth/confirm` - After email verification
- `POST /api/auth/login` - After login
