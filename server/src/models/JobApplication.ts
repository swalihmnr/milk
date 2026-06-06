import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  status: 'pending' | 'verified_by_admin' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'DeliveryJob', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified_by_admin', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// A driver can only apply to a specific job once
JobApplicationSchema.index({ jobId: 1, driverId: 1 }, { unique: true });

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
