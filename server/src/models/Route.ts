import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  area: string;
  deliveryBoyId?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
}

const RouteSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  area: { type: String, required: true },
  deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

export default mongoose.model<IRoute>('Route', RouteSchema);
