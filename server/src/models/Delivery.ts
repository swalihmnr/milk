import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  farmerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  deliveryBoyId?: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  date: Date;
  shift: 'morning' | 'evening';
  quantity: number;
  status: 'pending' | 'delivered' | 'missed';
  proofImageUrl?: string;
  deliveryLat?: number;
  deliveryLon?: number;
  confirmedAt?: Date;
  complaintWindowEndsAt?: Date;
  isAutoConfirmed: boolean;
  missedReason?: string;
  notes?: string;
  // OTP for in-person handover verification
  handoverOtp?: string;
  handoverOtpExpiresAt?: Date;
}

const DeliverySchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'User' },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['morning', 'evening'], required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'delivered', 'missed'], default: 'pending' },
  proofImageUrl: { type: String },
  deliveryLat: { type: Number },
  deliveryLon: { type: Number },
  confirmedAt: { type: Date },
  complaintWindowEndsAt: { type: Date },
  isAutoConfirmed: { type: Boolean, default: false },
  missedReason: { type: String },
  notes: { type: String },
  // OTP for in-person handover verification
  handoverOtp: { type: String },
  handoverOtpExpiresAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
