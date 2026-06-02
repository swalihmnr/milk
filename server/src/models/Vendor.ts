import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  gstNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  approvalStatus: 'pending' | 'approved' | 'suspended';
  commissionRate: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  gstNumber: { type: String },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  commissionRate: { type: Number, default: 10 },
  totalRevenue: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IVendor>('Vendor', VendorSchema);
