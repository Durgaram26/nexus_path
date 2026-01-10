# Certificate & PDF Submission System - MongoDB Integration

## Overview
The certificate submission system uses MongoDB to store certificate metadata and the local file system to store PDF files. This provides a balance between database querying capabilities and efficient file storage.

## Architecture

### 1. MongoDB Schema (CertificateSubmission)

```prisma
model CertificateSubmission {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  studentId       String @db.ObjectId
  courseName      String
  courseProvider  String
  completionDate  DateTime
  certificateFile String   // File path or URL (filename only)
  description     String?
  courseLink      String?
  courseType      String   @default("online-course")
  status          String   @default("pending") // pending, approved, rejected
  submittedAt     DateTime @default(now())
  evaluatedAt     DateTime?
  evaluatedBy     String? @db.ObjectId // Faculty ID who evaluated
  facultyComments String?
  grade           String?  // A, B, C, D, F
  
  // Relations
  student         Student
  evaluator       Faculty?
  
  @@index([status])
  @@index([studentId])
  @@index([evaluatedBy])
}
```

**Fields:**
- `id`: MongoDB ObjectId (unique identifier)
- `studentId`: Reference to Student document
- `courseName`: Name of the course/certification
- `courseProvider`: Provider/platform (Coursera, edX, Udemy, etc.)
- `completionDate`: When the course was completed
- `certificateFile`: Filename (PDF stored on disk, not in DB)
- `status`: Processing status (pending → approved/rejected)
- `evaluatedBy`: Faculty ID who reviewed the certificate
- `facultyComments`: Evaluation feedback
- `grade`: Final grade assigned by evaluator

## Data Flow

### Student Submission Process

```
1. Student Fills Form
   ├── Course Name
   ├── Provider (Coursera, edX, etc.)
   ├── Completion Date
   ├── PDF File Upload
   └── Description (optional)
   
2. API Receives Request (/api/student/certificate-submission)
   ├── Validates PDF file
   │  ├── Must be PDF type
   │  └── Max 10MB size
   ├── Saves file to /uploads/certificates/
   │  └── Filename: {timestamp}_{original_name}.pdf
   └── Creates MongoDB record
   
3. Database Entry
   ├── MongoDB stores metadata
   ├── certificateFile field = filename only
   └── status = "pending"
   
4. Faculty Review (/faculty/certificate-evaluation)
   ├── Views all pending submissions
   ├── Can preview PDF
   ├── Approves/Rejects
   └── Adds grade & comments
   
5. Update Status
   ├── MongoDB updates: status, evaluatedBy, facultyComments, grade
   └── Student sees result
```

## API Endpoints

### 1. Submit Certificate
**POST** `/api/student/certificate-submission`

**Request:**
```typescript
FormData {
  courseName: string,
  courseProvider: string,
  completionDate: ISO DateTime,
  certificateFile: File (PDF),
  description?: string,
  courseLink?: string,
  courseType?: string
}
```

**Process:**
```typescript
// 1. Verify JWT token (student role)
const decoded = verifyToken(token);

// 2. Validate file
if (file.type !== 'application/pdf') throw error;
if (file.size > 10 * 1024 * 1024) throw error;

// 3. Save to disk
const filename = `${timestamp}_${sanitizedName}.pdf`;
fs.writeFileSync('/uploads/certificates/{filename}', buffer);

// 4. Create MongoDB record
const submission = await prisma.certificateSubmission.create({
  data: {
    studentId: student.id,
    courseName,
    courseProvider,
    completionDate,
    certificateFile: filename,  // Store filename, not full path
    status: 'pending'
  }
});

// 5. Return success
return { success: true, submission }
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate submitted successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439012",
    "courseName": "Python for Data Science",
    "courseProvider": "Coursera",
    "completionDate": "2026-01-10T00:00:00Z",
    "certificateFile": "1673536800000_python-certificate.pdf",
    "status": "pending",
    "submittedAt": "2026-01-10T14:30:00Z"
  }
}
```

### 2. Get Student's Submissions
**GET** `/api/student/certificate-submission`

**Query:**
- Filters by authenticated student's ID
- Returns all submissions (pending, approved, rejected)
- Ordered by newest first

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "courseName": "Python for Data Science",
      "courseProvider": "Coursera",
      "certificateFile": "1673536800000_python-certificate.pdf",
      "status": "approved",
      "grade": "A",
      "submittedAt": "2026-01-10T14:30:00Z",
      "evaluatedAt": "2026-01-10T15:45:00Z"
    }
  ]
}
```

### 3. Download Certificate PDF
**GET** `/api/certificate-files/{filename}`

**Process:**
```typescript
// Read from disk
const filePath = `/uploads/certificates/{filename}`;
const buffer = fs.readFileSync(filePath);

// Return as downloadable file
response.headers['Content-Type'] = 'application/pdf';
response.headers['Content-Disposition'] = 'attachment; filename="${filename}"';
return buffer;
```

### 4. Faculty Reviews Submissions
**GET** `/api/faculty/certificate-submissions`

**Query Parameters:**
- `search`: Search by course name, provider, student name/email
- `status`: Filter by pending/approved/rejected
- `department`: Filter by student department
- `year`: Filter by student year
- `careerPath`: Filter by student career path
- `courseProvider`: Filter by course provider
- `courseAssignment`: Filter by active assignments

**Response:**
```json
{
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "courseName": "Machine Learning",
      "certificateFile": "1673536800000_ml-certificate.pdf",
      "student": {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "department": { "id": "...", "name": "CSE" },
        "year": 2
      },
      "status": "pending",
      "submittedAt": "2026-01-10T14:30:00Z"
    }
  ],
  "filterOptions": {
    "departments": [{ "id": "...", "name": "CSE" }],
    "careerPaths": [{ "id": "...", "name": "Full Stack" }],
    "courseProviders": ["Coursera", "edX", "Udemy"],
    "years": [1, 2, 3, 4]
  }
}
```

### 5. Faculty Evaluates Certificate
**PUT** `/api/faculty/certificate-submissions`

**Request:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "status": "approved",
  "grade": "A",
  "comments": "Excellent completion of advanced topics",
  "evaluatedBy": "faculty-user-id"
}
```

**Process:**
```typescript
const updated = await prisma.certificateSubmission.update({
  where: { id },
  data: {
    status,
    grade,
    facultyComments: comments,
    evaluatedBy: evaluatedBy,
    evaluatedAt: new Date()
  }
});
```

## File Storage Structure

```
project-root/
└── uploads/
    └── certificates/
        ├── 1673536800000_python-certificate.pdf
        ├── 1673536801000_coursera-ml-cert.pdf
        ├── 1673536802000_udemy-web-dev.pdf
        └── 1673536803000_edx-data-science.pdf
```

**Filename Format:** `{timestamp}_{sanitized_original_name}.pdf`

**Advantages:**
- Filename includes timestamp (prevents collisions)
- Original filename preserved (sanitized for safety)
- Easy to organize and clean up
- Separates file system from database

## MongoDB Queries

### Find All Pending Submissions
```typescript
const pending = await prisma.certificateSubmission.findMany({
  where: { status: 'pending' },
  include: { student: true }
});
```

### Find Submissions by Provider
```typescript
const coursera = await prisma.certificateSubmission.findMany({
  where: { courseProvider: 'Coursera' }
});
```

### Find Approved Certificates for a Student
```typescript
const approved = await prisma.certificateSubmission.findMany({
  where: {
    studentId: 'student-id',
    status: 'approved'
  },
  include: { evaluator: true }
});
```

### Get Statistics
```typescript
const stats = await prisma.certificateSubmission.groupBy({
  by: ['status', 'courseProvider'],
  _count: true
});
// Result: Group counts by status and provider
```

## Security Features

### 1. File Validation
```typescript
// Type validation
if (file.type !== 'application/pdf') {
  throw 'Only PDF files allowed';
}

// Size validation
if (file.size > 10 * 1024 * 1024) {
  throw 'File too large (max 10MB)';
}

// Filename sanitization
const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
```

### 2. Access Control
```typescript
// Only students can submit
if (decoded.role !== 'student') throw 'Unauthorized';

// Only faculty can evaluate
if (decoded.role !== 'faculty') throw 'Unauthorized';

// Faculty can only see their department's students (if implemented)
```

### 3. Database Indexes
```prisma
@@index([status])           // Fast filtering by status
@@index([studentId])        // Quick student lookups
@@index([evaluatedBy])      // Find submissions by evaluator
```

## Workflow Example

**Day 1: Student Submits Certificate**
```
Student: Completes ML course on Coursera
Student: Navigates to /app/student/certificate-submission
Student: 
  - Enters "Machine Learning Specialization"
  - Selects "Coursera"
  - Uploads certificate PDF
  - Clicks Submit

System:
  1. Validates PDF (type, size)
  2. Saves to /uploads/certificates/1673536800000_ml-cert.pdf
  3. Creates MongoDB record:
     {
       studentId: "...",
       courseName: "Machine Learning Specialization",
       courseProvider: "Coursera",
       certificateFile: "1673536800000_ml-cert.pdf",
       status: "pending"
     }
  4. Returns success message

Student: Sees "Certificate submitted successfully"
```

**Day 2: Faculty Reviews**
```
Faculty: Navigates to /app/faculty/certificate-evaluation
Faculty: Sees list of pending submissions
Faculty: Clicks on student's submission
Faculty: 
  - Previews PDF
  - Reviews course details
  - Assigns grade "A"
  - Adds comment "Excellent work"
  - Clicks "Approve"

System:
  1. Updates MongoDB record:
     {
       status: "approved",
       grade: "A",
       facultyComments: "Excellent work",
       evaluatedBy: "faculty-id",
       evaluatedAt: "2026-01-11T10:00:00Z"
     }
  2. Returns updated record

Faculty: Sees "Certificate approved successfully"
```

**Day 3: Student Checks Status**
```
Student: Navigates to certificate page
Student: Sees submission with:
  - Status: "Approved"
  - Grade: "A"
  - Comments: "Excellent work"

Student: Can download certificate PDF
```

## Database Size Considerations

For MongoDB:
- Each CertificateSubmission record: ~500 bytes
- 10,000 submissions: ~5 MB
- 100,000 submissions: ~50 MB

File storage:
- Average PDF: 500 KB - 2 MB
- 1,000 certificates: 500 MB - 2 GB
- 10,000 certificates: 5 GB - 20 GB

**Recommendation:**
- Keep PDFs in file system (not as blobs in MongoDB)
- Use MongoDB for metadata indexing and filtering
- Implement cleanup policy for rejected certificates

## Future Enhancements

1. **OCR Integration**
   - Extract text from PDFs
   - Validate certificate authenticity
   - Auto-fill course details

2. **Cloud Storage**
   - Move certificates to AWS S3 / Google Cloud
   - Reduce server storage needs
   - Enable CDN distribution

3. **Certificate Verification**
   - QR codes on certificates
   - Verify with course providers
   - Create blockchain records

4. **Batch Processing**
   - Bulk evaluation
   - Auto-approval for known providers
   - Notification system

5. **Analytics**
   - Certificate submission trends
   - Popular course providers
   - Approval rates by department

