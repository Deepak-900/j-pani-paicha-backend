const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('colors');

// Configure upload directory
const uploadDir = path.join(__dirname, '../public/uploads/profile');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created profile upload directory'.green.bold);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        console.log('✅ Valid image file uploaded'.green);
        return cb(null, true);
    }

    console.error('❌ Invalid file type attempted:'.red, file.mimetype);
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Allow only single file
    }
});

// Error handling middleware
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('❌ Multer upload error:'.red.bold, err);
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE'
                ? 'File too large (max 5MB)'
                : 'File upload error'
        });
    } else if (err) {
        console.error('❌ Upload error:'.red.bold, err);
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    }
    next();
};

module.exports = {
    singleUpload: upload.single('avatar'),
    handleUploadErrors
};