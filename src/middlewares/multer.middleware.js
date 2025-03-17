// import multer from 'multer'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/temp')
//     },
//     filename: function (req, file, cb) {

//         cb(null, file.originalname)
//     }
// })

// export const upload = multer({
//     storage
// })

import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the temp directory path
const tempDir = path.join(process.cwd(), 'public', 'temp');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure temp directory exists every time a file is uploaded
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
