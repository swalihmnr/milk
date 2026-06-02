import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerMilkPlan extends Document {
  customerId: mongoose.Types.ObjectId;
  milkType: string;
  quantity: number;
  unit: string;
  morningQuantity: number;
  eveningQuantity: number;
  scheduleType: 'daily' | 'alternate' | 'custom';
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: Date;
  pauseStartDate?: Date;
  pauseEndDate?: Date;
  autoRenewal: boolean;
}

const CustomerMilkPlanSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  milkType: { type: String, required: true, default: 'cow' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'L' },
  morningQuantity: { type: Number, default: 0 },
  eveningQuantity: { type: Number, default: 0 },
  scheduleType: { type: String, enum: ['daily', 'alternate', 'custom'], default: 'daily' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  startDate: { type: Date, required: true },
  pauseStartDate: { type: Date },
  pauseEndDate: { type: Date },
  autoRenewal: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ICustomerMilkPlan>('CustomerMilkPlan', CustomerMilkPlanSchema);
