import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  status: 'active' | 'inactive' | 'suspended';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
  // Farmer-specific profile
  farmName?: string;
  addressLine?: string;
  village?: string;
  city?: string;
  state?: string;
  herdSize?: number;
  lat?: number;
  lon?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  // Farmer profile fields
  farmName: { type: String },
  addressLine: { type: String },
  village: { type: String },
  city: { type: String },
  state: { type: String },
  herdSize: { type: Number },
  lat: { type: Number },
  lon: { type: Number },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
