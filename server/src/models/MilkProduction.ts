import mongoose, { Schema, Document } from 'mongoose';

export interface IMilkProduction extends Document {
  farmerId: mongoose.Types.ObjectId;
  cowId?: mongoose.Types.ObjectId; // Optional if tracking herd-wide
  date: Date;
  morningLiters: number;
  eveningLiters: number;
  totalLiters: number;
  fatPercentage?: number;
  notes?: string;
}

const MilkProductionSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cowId: { type: Schema.Types.ObjectId, ref: 'Cow' },
  date: { type: Date, required: true },
  morningLiters: { type: Number, default: 0 },
  eveningLiters: { type: Number, default: 0 },
  totalLiters: { type: Number, required: true },
  fatPercentage: { type: Number },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IMilkProduction>('MilkProduction', MilkProductionSchema);
