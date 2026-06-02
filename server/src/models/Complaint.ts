import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  farmerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  resolvedAt?: Date;
}

const ComplaintSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
