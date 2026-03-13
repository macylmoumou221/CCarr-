# CCarré Backend - Image Upload & Cloudinary Integration ✅

## Status: READY FOR TESTING

All Cloudinary and image upload functionality has been successfully integrated and verified with TypeScript compilation.

## What's Been Configured

### 1. **Cloudinary Integration** (`src/config/cloudinary.ts`)
- ✅ Configured v2 SDK initialization
- ✅ Environment variables loaded (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
- ✅ Upload function with stream-based API
- ✅ Images saved to `ccarre/annonces` folder
- ✅ Returns secure HTTPS URLs

### 2. **Multer File Upload Middleware** (`src/middlewares/upload.middleware.ts`)
- ✅ In-memory storage (no disk writes)
- ✅ File type validation: JPEG, JPG, PNG, WebP only
- ✅ Max file size: 5MB per image
- ✅ Max files: 6 images per request
- ✅ Integrated into POST and PUT routes

### 3. **FormData Support in Controllers** (`src/controllers/annonce.controller.ts`)
- ✅ `parseImagesInput()` - Handles JSON-stringified image URLs from FormData
- ✅ `uploadFilesFromRequest()` - Processes multipart files via multer
- ✅ Parallel upload with Promise.all
- ✅ Merges body images + uploaded files

### 4. **Routes Integration** (`src/routes/annonce.routes.ts`)
- ✅ POST /api/annonces - Create with images (multer.array('images', 6))
- ✅ PUT /api/annonces/:id - Update with images
- ✅ Full FormData support on both endpoints

### 5. **Type Safety** (`src/types/express.d.ts`)
- ✅ Extended Express Request with file?: Multer.File
- ✅ Extended Express Request with files?: Multer.File[]
- ✅ Full TypeScript support for file handling

### 6. **Dependencies** (package.json)
- ✅ cloudinary: ^2.9.0
- ✅ multer: ^2.1.1
- ✅ @types/multer: ^2.1.0

### 7. **Environment Configuration** (.env)
- ✅ Placeholder Cloudinary credentials included
- ✅ .env.example created for reference

## How to Use

### Step 1: Configure Cloudinary Credentials

Get your credentials from https://cloudinary.com/console/settings/api-keys

Update `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Test the Upload Flow

#### Option A: Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('title', 'Test Item');
formData.append('description', 'Test Description');
formData.append('type', 'vente');
formData.append('category', 'test');

// Add image files
const fileInput = document.querySelector('input[type="file"]');
for (let file of fileInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/annonces', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log('Images uploaded:', result.data.annonce.images);
```

#### Option B: Using cURL
```bash
curl -X POST http://localhost:5000/api/annonces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test Item" \
  -F "description=Test Description" \
  -F "type=vente" \
  -F "category=test" \
  -F "images=@/path/to/image.jpg" \
  -F "images=@/path/to/image2.png"
```

### Step 3: Verify the Response

Success response:
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "annonce": {
      "_id": "...",
      "title": "Test Item",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ccarre/annonces/img123.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ccarre/annonces/img456.png"
      ],
      ...
    }
  }
}
```

## Upload Flow Architecture

```
Client (FormData with files)
         ↓
    POST /api/annonces
         ↓
    authMiddleware (JWT verification)
         ↓
    multer (upload.array('images', 6))
    - Validates file types
    - Limits file size to 5MB
    - Stores in memory (req.files)
         ↓
    createAnnonce controller
    - parseImagesInput() → extract body image URLs
    - uploadFilesFromRequest() → upload to Cloudinary
    - Promise.all() → parallel uploads
    - Merge URLs + uploaded file URLs
         ↓
    Cloudinary uploader.upload_stream()
    - Folder: ccarre/annonces
    - Returns: secure_url
         ↓
    Annonce.create() with merged image URLs
         ↓
    Response: 201 with annonce including image URLs
         ↓
    Client (receives Cloudinary HTTPS URLs)
```

## File Structure Summary

```
src/
├── config/
│   └── cloudinary.ts           ✅ Cloudinary SDK setup & upload function
├── middlewares/
│   └── upload.middleware.ts    ✅ Multer configuration
├── controllers/
│   └── annonce.controller.ts   ✅ Image handling (parse, upload, merge)
├── routes/
│   └── annonce.routes.ts       ✅ Upload middleware on POST/PUT
└── types/
    └── express.d.ts            ✅ File type extensions
```

## Validation & Error Handling

### File Validation
- ✅ Only JPEG, JPG, PNG, WebP allowed
- ✅ Max 5MB per file
- ✅ Max 6 files per request
- ✅ Error: 400 "Format image invalide..."

### Business Logic Validation
- ✅ Type must be: vente, pret, or demandePret
- ✅ Title, description, type are required
- ✅ Owner verification on update/delete
- ✅ Annonce exists check

### Error Responses
```json
{
  "success": false,
  "message": "Format image invalide (jpeg, jpg, png, webp uniquement)"
}
```

## TypeScript Compilation

✅ **Status**: PASSING (zero errors)

```bash
npx tsc --noEmit
# Compiles with no errors
```

## Next Steps

1. **Set Cloudinary Credentials**: Update .env with real credentials
2. **Test Upload Flow**: Use the examples above to test file uploads
3. **Monitor Cloudinary Dashboard**: Verify images appear in ccarre/annonces folder
4. **Frontend Integration**: Implement FormData on frontend as shown in examples

## Key Features

- ✅ Full FormData support (files + mixed URLs)
- ✅ Parallel image uploads (Promise.all)
- ✅ Secure Cloudinary URLs (HTTPS)
- ✅ Type-safe multer integration
- ✅ Comprehensive error handling
- ✅ Memory-efficient (no disk writes)
- ✅ Validated file types & sizes
- ✅ Ownership protection on updates

## Documentation

See [IMAGE_UPLOAD_GUIDE.md](./IMAGE_UPLOAD_GUIDE.md) for detailed usage examples and API documentation.
