import mongoose, { Schema, Document } from 'mongoose';

export interface IRefund extends Document {
  orderId?: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  reason: { type: String, required: true },
  adminNotes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IRefund>('Refund', RefundSchema);
