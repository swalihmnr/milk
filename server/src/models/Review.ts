import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  deliveryBoyId?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IReview>('Review', ReviewSchema);
