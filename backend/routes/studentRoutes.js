const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { put } = require('@vercel/blob');
const router = express.Router();
const db = require('../config/db');

const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const localDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: useBlobStorage ? multer.memoryStorage() : localDiskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const saveProfileImage = async (file) => {
  if (!file) {
    return null;
  }

  if (useBlobStorage) {
    const extension = path.extname(file.originalname) || '.png';
    const blob = await put(`profiles/profile-${Date.now()}${extension}`, file.buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return blob.url;
  }

  return `/uploads/profiles/${file.filename}`;
};

const removeProfileImage = async (file) => {
  if (!file || useBlobStorage) {
    return;
  }

  if (file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Student routes are working!' });
});

// Get all students
router.get('/', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get student profile with activities (MUST be before /search route)
router.get('/profile/:student_id', (req, res) => {
    const studentId = req.params.student_id;
    console.log('Profile request for student ID:', studentId); // Debug log
    
    // Get student info
    db.query('SELECT * FROM students WHERE student_id = ?', [studentId], (err, studentResults) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (studentResults.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        
        const student = studentResults[0];
        
        // Get student activities (attendance history)
        const activitiesQuery = `
            SELECT al.*, 
                   CASE 
                       WHEN al.check_out IS NULL THEN 'Currently Active'
                       ELSE CONCAT('Checked out at ', DATE_FORMAT(al.check_out, '%Y-%m-%d %H:%i:%s'))
                   END as status,
                   TIMESTAMPDIFF(MINUTE, al.check_in, COALESCE(al.check_out, NOW())) as duration_minutes
            FROM attendance_logs al
            WHERE al.student_id = ?
            ORDER BY al.check_in DESC
            LIMIT 20
        `;
        
        db.query(activitiesQuery, [student.id], (err, activitiesResults) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Get total visits count
            db.query('SELECT COUNT(*) as total_visits FROM attendance_logs WHERE student_id = ?', [student.id], (err, countResults) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                res.json({
                    student: student,
                    activities: activitiesResults,
                    total_visits: countResults[0].total_visits
                });
            });
        });
    });
});

// Search students
router.get('/search', (req, res) => {
    const searchTerm = `${req.query.q || ''}`.trim();
    console.log('Searching for student:', searchTerm); // Debug log

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const likeTerm = `%${searchTerm}%`;
    const query = `
        SELECT * FROM students 
        WHERE student_id = ?
        OR student_id LIKE ?
        OR first_name LIKE ?
        OR last_name LIKE ?
        OR CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?
        ORDER BY last_name ASC, first_name ASC
        LIMIT 12
    `;
    
    db.query(query, [searchTerm, likeTerm, likeTerm, likeTerm, likeTerm], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message 
            });
        }
        console.log('Search results:', results); // Debug log
        res.json(results);
    });
});

// Upload profile image
router.post('/upload-image/:student_id', upload.single('profile_image'), (req, res) => {
    const studentId = req.params.student_id;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    saveProfileImage(req.file)
        .then((imagePath) => {
            db.query(
                'UPDATE students SET profile_image = ? WHERE student_id = ?',
                [imagePath, studentId],
                async (err, result) => {
                    if (err) {
                        await removeProfileImage(req.file);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    if (result.affectedRows === 0) {
                        await removeProfileImage(req.file);
                        res.status(404).json({ error: 'Student not found' });
                        return;
                    }
                    
                    res.json({ 
                        message: 'Image uploaded successfully',
                        imagePath: imagePath
                    });
                }
            );
        })
        .catch((error) => {
            console.error('Image upload error:', error);
            res.status(500).json({ error: 'Could not upload image' });
        });
});

// Serve uploaded images
router.get('/image/:filename', (req, res) => {
    if (useBlobStorage) {
        return res.status(404).json({ error: 'Blob-hosted images are served directly from their stored URL' });
    }

    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/profiles', filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

// Add new student
router.post('/', upload.single('profile_image'), async (req, res) => {
    const studentData = { ...req.body };
    
    try {
        if (req.file) {
            studentData.profile_image = await saveProfileImage(req.file);
        }
        
        db.query('INSERT INTO students SET ?', studentData, async (err, result) => {
            if (err) {
                if (req.file) {
                    await removeProfileImage(req.file);
                }

                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(409).json({ error: 'Student ID already exists' });
                    return;
                }

                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: result.insertId, ...studentData });
        });
    } catch (error) {
        console.error('Student creation error:', error);
        res.status(500).json({ error: 'Could not save student record' });
    }
});

module.exports = router;
