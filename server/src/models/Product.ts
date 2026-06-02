import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  price: number;
  unit: string; // e.g., '1 Litre', '500g'
  stockQuantity: number;
  imageUrl?: string;
  rating?: number;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  stockQuantity: { type: Number, default: 0 },
  imageUrl: { type: String },
  rating: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);
