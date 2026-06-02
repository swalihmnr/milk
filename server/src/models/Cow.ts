import mongoose, { Schema, Document } from 'mongoose';

export interface ICow extends Document {
  farmerId: mongoose.Types.ObjectId;
  cowCode: string;
  breed: string;
  age: number;
  purchaseOrBirthDate: Date;
  healthStatus: 'healthy' | 'sick' | 'pregnant' | 'dry';
  pregnancyStatus?: string;
  averageMilkOutput: number;
  morningOutput: number;
  eveningOutput: number;
  feedType?: string;
  lastVaccinationDate?: Date;
  nextVaccinationDate?: Date;
  vetName?: string;
  notes?: string;
}

const CowSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cowCode: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  purchaseOrBirthDate: { type: Date, required: true },
  healthStatus: { type: String, enum: ['healthy', 'sick', 'pregnant', 'dry'], default: 'healthy' },
  pregnancyStatus: { type: String },
  averageMilkOutput: { type: Number, default: 0 },
  morningOutput: { type: Number, default: 0 },
  eveningOutput: { type: Number, default: 0 },
  feedType: { type: String },
  lastVaccinationDate: { type: Date },
  nextVaccinationDate: { type: Date },
  vetName: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ICow>('Cow', CowSchema);
