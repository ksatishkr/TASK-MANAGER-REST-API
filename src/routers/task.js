const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : parts[1] === "asc" ? 1 : 0;
  } else {
    sort.createdAt = -1; // Default sorting (newest first) if no sortBy is given
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const isValidUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    isValidUpdates.includes(update)
  );
  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates!" });
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    updates.forEach((key) => (task[key] = req.body[key]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
module.exports = router;
