# Image Upload Guide - FormData Support

The CCarré backend now supports image uploads via Cloudinary using FormData. Here's how to use it:

## Setup

1. **Configure Cloudinary Credentials**

   Get your Cloudinary credentials from https://cloudinary.com/console

   Update `.env` with:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Available Upload Endpoints**

   - **POST /api/annonces** - Create annonce with images
   - **PUT /api/annonces/:id** - Update annonce images

## Usage Examples

### Create Annonce with Images (FormData)

```javascript
const formData = new FormData();
formData.append('title', 'Livre de Python');
formData.append('description', 'Un excellent livre pour apprendre Python');
formData.append('type', 'vente');
formData.append('category', 'livres');

// Add multiple image files
const imageInput = document.querySelector('input[type="file"]');
for (let file of imageInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const data = await response.json();
console.log('Created annonce:', data.data.annonce);
```

### Create Annonce with Mixed Images (FormData + URLs)

You can also send image URLs along with files:

```javascript
const formData = new FormData();
formData.append('title', 'Livre de Python');
formData.append('description', 'Un excellent livre pour apprendre Python');
formData.append('type', 'vente');
formData.append('category', 'livres');

// Add existing image URLs as JSON array
const existingImages = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
];
formData.append('images', JSON.stringify(existingImages));

// Add new files
const imageInput = document.querySelector('input[type="file"]');
for (let file of imageInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

### Update Annonce Images

```javascript
const formData = new FormData();

// Optional: Update text fields
formData.append('title', 'Updated Title');
formData.append('description', 'Updated description');

// Add new images
const imageInput = document.querySelector('input[type="file"]');
for (let file of imageInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces/ANNONCE_ID', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

### Using cURL

```bash
# Create annonce with image file
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Livre de Python" \
  -F "description=Un excellent livre" \
  -F "type=vente" \
  -F "category=livres" \
  -F "images=@path/to/image.jpg"

# With multiple files
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Livre de Python" \
  -F "description=Un excellent livre" \
  -F "type=vente" \
  -F "category=livres" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

## Technical Details

### Multer Configuration
- **Storage**: In-memory (no disk writes)
- **Max File Size**: 5MB per image
- **Max Files**: 6 images per request
- **Allowed Formats**: JPEG, JPG, PNG, WebP

### Cloudinary Upload
- **Folder**: `ccarre/annonces`
- **Auto-sizing**: Cloudinary handles responsive sizing
- **Secure URLs**: Returns HTTPS URLs for all images
- **Async Processing**: Non-blocking with Promise.all

### Image Handling Flow

1. **Parse Request**
   - Extract images from req.body (if URLs provided as JSON)
   - Extract files from req.files (multer-captured FormData files)

2. **Upload Files**
   - All files uploaded in parallel via Promise.all
   - Each file → Cloudinary uploader → secure_url returned

3. **Merge & Store**
   - Combine body URLs + uploaded URLs into single array
   - Save to MongoDB annonce.images field

4. **Response**
   - Return annonce with full image URLs in images array

## Validation

- **Type Validation**: type must be 'vente', 'pret', or 'demandePret'
- **Required Fields**: title, description, type
- **File Validation**: Only JPEG, JPG, PNG, WebP allowed
- **Size Validation**: Max 5MB per file, max 6 files per request

## Response Format

```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "67a8b2c3d4e5f6g7h8i9j0k1",
      "title": "Livre de Python",
      "description": "Un excellent livre pour apprendre Python",
      "type": "vente",
      "category": "livres",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ccarre/annonces/abc123.jpg"
      ],
      "owner": {
        "_id": "user_id",
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

## Error Handling

```json
{
  "success": false,
  "message": "Format image invalide (jpeg, jpg, png, webp uniquement)"
}
```

Possible errors:
- 400: Invalid file format or missing required fields
- 401: Missing or invalid JWT token
- 403: Not authorized to modify/delete this annonce
- 404: Annonce not found
- 500: Cloudinary upload failed
