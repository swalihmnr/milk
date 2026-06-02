import mongoose, { Schema, Document } from 'mongoose';

export interface ICowHealthRecord extends Document {
  cowId: mongoose.Types.ObjectId;
  recordType: 'vaccination' | 'treatment' | 'checkup' | 'insemination';
  description: string;
  treatment?: string;
  vetName?: string;
  date: Date;
  nextFollowUpDate?: Date;
}

const CowHealthRecordSchema: Schema = new Schema({
  cowId: { type: Schema.Types.ObjectId, ref: 'Cow', required: true },
  recordType: { type: String, enum: ['vaccination', 'treatment', 'checkup', 'insemination'], required: true },
  description: { type: String, required: true },
  treatment: { type: String },
  vetName: { type: String },
  date: { type: Date, required: true },
  nextFollowUpDate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<ICowHealthRecord>('CowHealthRecord', CowHealthRecordSchema);
