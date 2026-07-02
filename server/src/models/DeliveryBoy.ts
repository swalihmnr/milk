import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryBoy extends Document {
  userId: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  vehicleType: string;
  licenseNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  currentLat?: number;
  currentLon?: number;
  totalDeliveries: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryBoySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  vehicleType: { type: String, required: true },
  licenseNumber: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  currentLat: { type: Number },
  currentLon: { type: Number },
  totalDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 }
}, {
  timestamps: true
});

export default mongoose.model<IDeliveryBoy>('DeliveryBoy', DeliveryBoySchema);
