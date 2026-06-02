import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address: string;
  houseName?: string;
  street?: string;
  area?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  routeId?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  notes?: string;
  lat?: number;
  lon?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  houseName: { type: String },
  street: { type: String },
  area: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String },
  lat: { type: Number },
  lon: { type: Number }
}, {
  timestamps: true
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
