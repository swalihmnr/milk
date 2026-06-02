import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  farmerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  billingMonth: string; // e.g. "2026-04"
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  dueDate: Date;
}

const InvoiceSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  billingMonth: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  dueDate: { type: Date, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
