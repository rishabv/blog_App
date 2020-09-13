var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middlewares/auth");
const Blog = require("../models/blog");
const multer = require("multer");

const upload = multer({
  dest: `/public/images`,
});

// Adding the blog to the data-base

router.post(
  "/addblog",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "description must be there ").not().isEmpty(),
    ],
  ],
  upload.single("img"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Blog({
        title: req.body.title,
        description: req.body.description,
        image: req.file,
        user: req.user.id,
      });
      const blog = await newPost.save();
      res.json(blog);
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ msg: "server error" });
    }
  }
);

// deleting the single blog by only auther of the blog

router.delete("/:BlogId", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.BlogId);
    if (blog.user.toString() !== req.user.id) {
      res.status(500).json({ msg: "only Auther can delete the blog" });
    }
    await blog.remove();
    res.json({ msg: "blog removed" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: "server error" });
  }
});

// fetching the blogposts by specific blog id

router.get("/:BlogId", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.BlogId);
    if (!blog) {
      res.status(500).json({ msg: "page not found" });
    }
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: "server error" });
  }
});

router.put(
  "/:blogId",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "description must be there ").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let blog = await Blog.findById(req.params.blogId);
      if (!blog) {
        res.status(500).json({ msg: "no blog found" });
      }
      blog = await Blog.findByIdAndUpdate(
        { _id: req.params.blogId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.json(blog);
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ msg: "server error" });
    }
  }
);

//fetching all the blogposts

router.get("/", auth, async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs) {
      res.status(500).json({ msg: "no blogs found" });
    }
    res.json(blogs);
    console.log(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: "server error" });
  }
});

//fetching the blogs by specific user

router.get("/myblogs/:userId", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.params.userId });
    if (!blogs) {
      res.status(500).json({ msg: "no blogs found" });
    }
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: "server error" });
  }
});

module.exports = router;
