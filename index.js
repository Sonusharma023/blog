const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const app = express()
const cors = require('cors')
const fs = require('fs'); 
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser')
const authRoute = require("./routes/auth")
const userRoute = require('./routes/users')
const postRoute = require('./routes/posts')
const commentRoute = require('./routes/comments')
const Post=require('./models/Post')



dotenv.config()
app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "/images")))
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(cookieParser())
app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/posts", postRoute)
app.use("/api/comments", commentRoute)


//image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images')
    },
    filename: function (req, file, cb) {
        const random = uuidv4()
        cb(null, random + "" + file.originalname)
    }
})

const upload = multer({ storage: storage })
// database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database is connected sucessfully");
    } catch (error) {
        console.log(error);
    }
}
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
app.post("/api/upload", upload.single("file"),async  (req, res) => {
    //  console.log(req.file.path)
   const uploadResult =  await cloudinary.uploader
        .upload(req.file.path)
        .catch((error) => {
            console.log(error);
        });
        
        // const newvar = new Post({photo:uploadResult.secure_url});
        // newvar.save()
    // Delete example_file.txt 
    fs.unlink((req.file.path),
        function (err) {
            if (err) console.log(err);
            else console.log("\nDeleted file");
        })
        res.status(200).json(uploadResult)
    })
    app.listen(process.env.PORT, () => {
        connectDB()
        console.log("app is running on port 5000");
    })