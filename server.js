const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("config");
const db = config.get("mongoURI");
const mongoose = require("mongoose");
var path = require("path");
// const connection = require("./connection");
var cors = require("cors");

// app.use(cors());
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

console.log("DB connected");

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


// Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/blog", require("./routes/blog"));
app.use(express.static(path.join(__dirname, "public")));

server.listen(5000, () => {
  console.log("server is running at 5000");
});
// "mongodb+srv://admin:password@123@cluster0.fmhnt.mongodb.net/Blog_app?retryWrites=true&w=majority"
