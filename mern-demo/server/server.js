const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");
const app = express();
const PORT = 5000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

if (!mongoUri) {
  console.error("MONGODB_URI is not defined. Check server/.env");
}

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true
}));
app.use(express.json());

// const client = new MongoClient(process.env.MONGODB_URI);

// API kiểm tra Backend
// app.get("/api/hello", (req, res) => {
//     res.json({
//         message: "Backend đang hoạt động!"
//     });
// });

// Kết nối MongoDB Atlas
mongoose
  .connect(mongoUri, {
    dbName: "cloud_lab"
  })
  .then(() => {
    console.log("MongoDB Atlas connected!");

    app.listen(PORT, () => {
      console.log(`Backend v1.2 running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });


app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message
    });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    const student = await Student.create({
      studentId,
      name,
      email
    });

    res.status(201).json(student);

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "MSSV hoặc email đã tồn tại"
      });
    }

    res.status(500).json({
      message: 'Lỗi khi thêm sinh viên',
      error: error.message
    });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "MSSV hoặc email đã tồn tại"
      });
    }

    res.status(400).json({
      message: "Lỗi khi cập nhật sinh viên",
      error: error.message
    });
  }
});


app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.json({
      message: "Xóa sinh viên thành công",
      student
    });
  } catch (error) {
    res.status(400).json({
      message: "Lỗi khi xóa sinh viên",
      error: error.message
    });
  }
});