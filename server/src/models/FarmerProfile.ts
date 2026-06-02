import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  dairyName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  subscriptionPlanId?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dairyName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  subscriptionPlanId: { type: Schema.Types.ObjectId, ref: 'Plan' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
