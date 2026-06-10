require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./src/models/Task");
const User = require("./src/models/User");

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne();
    const task = new Task({ title: "Test Task", status: "pending", user: user._id, deletedAt: new Date() });
    await task.save();
    console.log("TASK_ID=" + task._id);
    process.exit(0);
}
run();
