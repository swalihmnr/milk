import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryJob extends Document {
  farmerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'open' | 'rejected' | 'closed' | 'filled';
  expiresAt: Date;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryJobSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'open', 'rejected', 'closed', 'filled'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
DeliveryJobSchema.index({ location: '2dsphere' });
// Index to automatically expire jobs after expiresAt
DeliveryJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IDeliveryJob>('DeliveryJob', DeliveryJobSchema);
