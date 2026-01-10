# MongoDB Certificate Storage Implementation

## Overview
Certificate PDFs are now stored directly in MongoDB as binary data (Bytes field) instead of being saved to the file system.

## Schema Changes

### Before
```prisma
model CertificateSubmission {
  certificateFile String   // File path or URL
  // ... other fields
}
```

### After
```prisma
model CertificateSubmission {
  certificateFile Bytes   // PDF file stored as binary data in MongoDB
  certificateFileName String   // Original filename for download
  fileMimeType    String   @default("application/pdf")
  fileSize        Int      // File size in bytes
  // ... other fields
}
```

**New Fields:**
- `certificateFile`: Bytes (Binary PDF data)
- `certificateFileName`: String (Original filename)
- `fileMimeType`: String (MIME type, default: "application/pdf")
- `fileSize`: Int (File size in bytes for reference)

## Benefits

✅ **Single Source of Truth**
- No file system dependencies
- All data in one database
- No file synchronization issues

✅ **Scalability**
- Easy to replicate across MongoDB instances
- No file server needed
- Better for distributed systems

✅ **Backup & Recovery**
- MongoDB handles all backups
- No separate file backup procedures
- Transactional consistency

✅ **Security**
- No file system access needed
- Database-level access control
- Audit trails for all access

✅ **Performance**
- Indexed queries on metadata
- MongoDB compression for large files
- Faster deployment/scaling

## API Changes

### 1. Submit Certificate
**POST** `/api/student/certificate-submission`

**Changes:**
- PDF converted to Buffer and stored directly
- No file system directory creation needed
- Filename stored for download reference

**Code:**
```typescript
// Convert file to buffer
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

// Store in MongoDB
const submission = await prisma.certificateSubmission.create({
  data: {
    certificateFile: buffer,  // Binary data
    certificateFileName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    // ... other fields
  }
});
```

### 2. Download Certificate
**GET** `/api/certificate-files/{filename}`

**Changes:**
- Fetches from MongoDB instead of file system
- Returns binary data directly
- No file I/O operations

**Code:**
```typescript
// Fetch from MongoDB
const submission = await prisma.certificateSubmission.findFirst({
  where: { certificateFileName: decodeURIComponent(filename) },
  select: {
    certificateFile: true,      // Binary data
    certificateFileName: true,
    fileMimeType: true
  }
});

// Return binary data
return new NextResponse(submission.certificateFile, {
  headers: {
    'Content-Type': submission.fileMimeType,
    'Content-Disposition': `attachment; filename="${submission.certificateFileName}"`
  }
});
```

### 3. Fetch Submissions List
**GET** `/api/student/certificate-submission`

**Changes:**
- Excludes binary data from queries (select specific fields)
- Faster queries by not loading PDF data
- Metadata only returned

**Code:**
```typescript
const submissions = await prisma.certificateSubmission.findMany({
  where: { studentId: student.id },
  select: {  // Exclude certificateFile binary data
    id: true,
    courseName: true,
    courseProvider: true,
    certificateFileName: true,
    fileSize: true,
    status: true,
    submittedAt: true,
    // ... other metadata fields
  }
});
```

## File System Cleanup

The `/uploads/certificates/` directory is no longer needed. You can safely delete it:

```bash
# On Windows
rmdir /s /q uploads\certificates

# On Linux/Mac
rm -rf uploads/certificates
```

## Migration from File System

If you have existing certificates stored as files, migrate them to MongoDB:

```typescript
import fs from 'fs';
import path from 'path';

const certificatePath = path.join(process.cwd(), 'uploads', 'certificates');

async function migrateToMongoDB() {
  const files = fs.readdirSync(certificatePath);
  
  for (const filename of files) {
    const filePath = path.join(certificatePath, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    
    // Find corresponding submission
    const submission = await prisma.certificateSubmission.findFirst({
      where: { certificateFile: filename }  // Old field had filename
    });
    
    if (submission) {
      // Update with binary data
      await prisma.certificateSubmission.update({
        where: { id: submission.id },
        data: {
          certificateFile: fileBuffer,
          certificateFileName: filename,
          fileMimeType: 'application/pdf',
          fileSize: stats.size
        }
      });
      
      console.log(`✅ Migrated: ${filename}`);
    }
  }
  
  console.log('Migration complete!');
}

// Run migration
await migrateToMongoDB();
```

## MongoDB Storage Considerations

### Storage Size
- Average PDF: 500 KB - 2 MB
- 1,000 certificates: 500 MB - 2 GB
- 10,000 certificates: 5 GB - 20 GB

**MongoDB Atlas Free Tier: 512 MB (suitable for small deployments)**
**MongoDB Atlas Paid Tier: Scalable (suitable for production)**

### Document Size Limit
MongoDB has a 16 MB document size limit per certificate, which accommodates even large PDFs.

### Compression
MongoDB can compress binary data, reducing storage by 30-50%.

### Performance Tips

1. **Use Indexes**
```prisma
@@index([status])
@@index([studentId])
@@index([evaluatedBy])
```

2. **Select Specific Fields**
When listing submissions, exclude binary data:
```typescript
select: {
  id: true,
  courseName: true,
  certificateFileName: true,
  // DO NOT select certificateFile here
}
```

3. **Pagination**
For large result sets, use pagination:
```typescript
const submissions = await prisma.certificateSubmission.findMany({
  take: 10,
  skip: (page - 1) * 10,
  where: { studentId: student.id }
});
```

## Testing

### Test Certificate Upload
```bash
curl -X POST http://localhost:3000/api/student/certificate-submission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "courseName=Python Basics" \
  -F "courseProvider=Coursera" \
  -F "completionDate=2026-01-10" \
  -F "certificateFile=@/path/to/certificate.pdf"
```

### Test Certificate Download
```bash
curl -X GET http://localhost:3000/api/certificate-files/certificate.pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_certificate.pdf
```

### Verify MongoDB Storage
```bash
# In MongoDB shell
db.certificatesubmission.findOne({ 
  certificateFileName: "certificate.pdf" 
})

# Check storage size
db.certificatesubmission.aggregate([
  { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
])
```

## Rollback to File System (if needed)

If you need to revert to file storage:

1. Update schema:
```prisma
certificateFile String   // Back to filename
```

2. Update API:
```typescript
// Save to disk instead of MongoDB
const filename = `${timestamp}_${originalName}`;
fs.writeFileSync(path.join(uploadDir, filename), buffer);

// Store only filename in database
certificateFile: filename
```

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Storage | File system | MongoDB |
| Location | `/uploads/certificates/` | MongoDB documents |
| Query Performance | Medium (file I/O) | Fast (database index) |
| Backup | Separate file backups | Automatic with MongoDB |
| Scaling | Difficult | Easy |
| Access Control | File permissions | Database roles |
| GDPR/Compliance | File tracking | Database audit logs |
| Disaster Recovery | Manual setup | Built-in replication |

## Next Steps

1. ✅ Schema updated to use Bytes
2. ✅ API endpoints updated to store/retrieve from MongoDB
3. ⏭️ Run `npx prisma db push` to apply changes (MongoDB doesn't use traditional migrations)
4. ⏭️ Test upload/download functionality
5. ⏭️ Migrate existing files to MongoDB (optional)
6. ⏭️ Delete file system directory once verified

