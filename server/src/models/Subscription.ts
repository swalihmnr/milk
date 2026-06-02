import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  customerId: mongoose.Types.ObjectId;
  planName: string;
  planType: 'daily' | 'monthly' | 'custom';
  frequency: 'daily' | 'weekly' | 'alternate_day' | 'custom';
  deliveryDays?: number[]; // e.g., [1, 3, 5] for Mon, Wed, Fri
  quantity: number;
  billingCycle: 'weekly' | 'monthly' | 'prepaid';
  price: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  renewalDate?: Date;
  autoRenewal: boolean;
  vacationMode: boolean;
  pauseStartDate?: Date;
  pauseEndDate?: Date;
}

const SubscriptionSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  planName: { type: String, required: true },
  planType: { type: String, enum: ['daily', 'monthly', 'custom'], required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'alternate_day', 'custom'], default: 'daily' },
  deliveryDays: [{ type: Number, min: 0, max: 6 }],
  quantity: { type: Number, required: true },
  billingCycle: { type: String, enum: ['weekly', 'monthly', 'prepaid'], default: 'monthly' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled', 'expired'], default: 'active' },
  renewalDate: { type: Date },
  autoRenewal: { type: Boolean, default: true },
  vacationMode: { type: Boolean, default: false },
  pauseStartDate: { type: Date },
  pauseEndDate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
