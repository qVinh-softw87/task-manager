const Task = require("../models/Task");

const runAutoTrashJob = () => {
    // Run every 5 minutes
    setInterval(async () => {
        try {
            // 1 hour ago
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // Find tasks that are completed, not yet trashed, and updated more than 1 hour ago
            const result = await Task.updateMany(
                {
                    status: "completed",
                    deletedAt: null,
                    updatedAt: { $lt: oneHourAgo }
                },
                {
                    $set: { deletedAt: new Date() }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Auto-Trash] Moved ${result.modifiedCount} completed tasks to trash.`);
            }
        } catch (error) {
            console.error("[Auto-Trash] Error running cron job:", error);
        }
    }, 5 * 60 * 1000); // 5 minutes in ms
};

module.exports = runAutoTrashJob;
