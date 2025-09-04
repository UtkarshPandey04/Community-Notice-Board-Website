import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  method: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: Number },
  ip: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('ActivityLog', activityLogSchema);
