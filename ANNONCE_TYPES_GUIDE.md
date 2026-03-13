# Annonce Types & Conditional Fields

## Overview

Each annonce type now requires specific fields based on its purpose:

| Type | Required Fields | Optional Fields | Purpose |
|------|-----------------|-----------------|---------|
| **vente** | `price` | images | Selling an item |
| **echange** | `exchangeFor`, `exchangeImage` | images | Trading for something |
| **pret** | `borrowPeriod` | images | Lending an item |
| **demandePret** | - | images | Requesting to borrow an item |

## Field Details

### 1. Vente (Sale)
**When to use:** Selling an item

**Required fields:**
- `price` (number) - Must be > 0
  - Example: `99.99`, `15`, `250.50`

**Example request:**
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=iPhone 12" \
  -F "description=Excellent état, très peu utilisé" \
  -F "type=vente" \
  -F "category=électronique" \
  -F "price=350" \
  -F "images=@phone.jpg"
```

**Example response:**
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "...",
      "title": "iPhone 12",
      "type": "vente",
      "price": 350,
      "images": ["https://res.cloudinary.com/..."],
      ...
    }
  }
}
```

---

### 2. Echange (Exchange/Trade)
**When to use:** Trading for something specific

**Required fields:**
- `exchangeFor` (string) - Description of what you're looking for in exchange
  - Min 5 characters, max 500 characters
  - Example: "Un MacBook Pro 2020 ou similaire"
- `exchangeImage` (file) - Picture of the item you want in exchange
  - Supports JPEG, JPG, PNG, WebP
  - Max 5MB

**Example request with FormData:**
```javascript
const formData = new FormData();
formData.append('title', 'Vélo VTT 2023');
formData.append('description', 'Vélo de montagne peu utilisé, très bon état');
formData.append('type', 'echange');
formData.append('category', 'sports');
formData.append('exchangeFor', 'Un tapis roulant ou un home gym');
formData.append('exchangeImage', fileInput.files[0]); // Picture of treadmill/gym

// Add pictures of the bike
for (let file of bikePhotos) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer JWT_TOKEN' },
  body: formData
});
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=Vélo VTT 2023" \
  -F "description=Vélo de montagne peu utilisé" \
  -F "type=echange" \
  -F "category=sports" \
  -F "exchangeFor=Un tapis roulant ou home gym" \
  -F "exchangeImage=@wanted_treadmill.jpg" \
  -F "images=@bike1.jpg" \
  -F "images=@bike2.jpg"
```

**Example response:**
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "...",
      "title": "Vélo VTT 2023",
      "type": "echange",
      "exchangeFor": "Un tapis roulant ou home gym",
      "exchangeImage": "https://res.cloudinary.com/.../wanted_treadmill.jpg",
      "images": ["https://res.cloudinary.com/.../bike1.jpg", "..."],
      ...
    }
  }
}
```

---

### 3. Pret (Loan/Borrow)
**When to use:** Lending an item to someone

**Required fields:**
- `borrowPeriod` (string) - Duration of the loan
  - Examples: "2 semaines", "1 mois", "3 mois", "jusqu'à fin mars"
  - Min 3 characters, max 100 characters

**Example request:**
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=Perceuse Bosch" \
  -F "description=Perceuse électrique en parfait état de fonctionnement" \
  -F "type=pret" \
  -F "category=outils" \
  -F "borrowPeriod=1 à 2 semaines" \
  -F "images=@drill.jpg"
```

**Example response:**
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "...",
      "title": "Perceuse Bosch",
      "type": "pret",
      "borrowPeriod": "1 à 2 semaines",
      "images": ["https://res.cloudinary.com/.../drill.jpg"],
      ...
    }
  }
}
```

---

### 4. DemandePret (Borrow Request)
**When to use:** Asking to borrow something from the community

**No required fields** - Just describe what you need

**Example request:**
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "title=Recherche - Perceuse électrique" \
  -F "description=J'ai besoin d'emprunter une perceuse pour un projet pendant le week-end" \
  -F "type=demandePret" \
  -F "category=outils"
```

---

## API Validation Rules

### Error Cases

**Missing required field for vente:**
```json
{
  "success": false,
  "message": "Un prix valide (> 0) est requis pour une annonce de vente"
}
```

**Missing required fields for echange:**
```json
{
  "success": false,
  "message": "Veuillez décrire ce que vous recherchez en échange"
}
```

**Invalid price (negative or zero):**
```json
{
  "success": false,
  "message": "Un prix valide (> 0) est requis pour une annonce de vente"
}
```

**Missing borrow period:**
```json
{
  "success": false,
  "message": "Veuillez spécifier la période de prêt (ex: \"2 semaines\", \"1 mois\")"
}
```

**Invalid file format:**
```json
{
  "success": false,
  "message": "Format image invalide (jpeg, jpg, png, webp uniquement)"
}
```

---

## Update (PUT) Endpoint

You can update any field, and conditional validation still applies:

```bash
# Update vente price
curl -X PUT http://localhost:5000/api/annonces/ANNONCE_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "price=400"

# Update echange description and image
curl -X PUT http://localhost:5000/api/annonces/ANNONCE_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "exchangeFor=Un nouveau MacBook Air M2" \
  -F "exchangeImage=@new_macbook.jpg"

# Update pret borrow period
curl -X PUT http://localhost:5000/api/annonces/ANNONCE_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "borrowPeriod=3 semaines"
```

---

## Data Validation Summary

| Field | Type | Min | Max | Required if |
|-------|------|-----|-----|------------|
| title | string | 3 chars | 120 chars | Always |
| description | string | 10 chars | 2000 chars | Always |
| type | enum | - | - | Always |
| category | string | - | 50 chars | Optional |
| price | number | > 0 | - | type = vente |
| exchangeFor | string | 5 chars | 500 chars | type = echange |
| exchangeImage | URL/file | - | 5MB | type = echange |
| borrowPeriod | string | 3 chars | 100 chars | type = pret |
| images | array | - | 6 files max | Optional |

---

## Complete Example: Create Exchange with All Fields

```javascript
async function createExchangeAnnonce() {
  const formData = new FormData();
  
  // Basic fields
  formData.append('title', 'Nintendo Switch + Jeux');
  formData.append('description', 'Console Nintendo Switch avec dock, contrôleurs et 3 jeux. État impeccable, très peu utilisée.');
  formData.append('type', 'echange');
  formData.append('category', 'gaming');
  
  // Exchange specific
  formData.append('exchangeFor', 'Une PS5 ou Xbox Series X avec jeux');
  
  // Add exchange image
  const exchangeImage = await fetch('/images/ps5-console.jpg').then(r => r.blob());
  formData.append('exchangeImage', exchangeImage, 'ps5-console.jpg');
  
  // Add item images
  const switch1 = await fetch('/images/switch1.jpg').then(r => r.blob());
  const switch2 = await fetch('/images/switch2.jpg').then(r => r.blob());
  formData.append('images', switch1, 'switch1.jpg');
  formData.append('images', switch2, 'switch2.jpg');
  
  // Send
  const response = await fetch('http://localhost:5000/api/annonces', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwtToken}` },
    body: formData
  });
  
  const result = await response.json();
  return result.data.annonce;
}
```
