import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  farmerId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  date: Date;
  description: string;
  vendor?: string;
  receiptUrl?: string;
}

const ExpenseSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  vendor: { type: String },
  receiptUrl: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
