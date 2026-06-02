import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  farmerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  method: 'cash' | 'upi' | 'bank_transfer' | 'other';
  status: 'success' | 'pending' | 'failed';
  transactionId?: string;
  collectedBy?: mongoose.Types.ObjectId;
  paidAt: Date;
  notes?: string;
}

const PaymentSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'other'], required: true },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  transactionId: { type: String },
  collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date, default: Date.now },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
