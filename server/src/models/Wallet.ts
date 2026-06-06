import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction {
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  referenceId?: string;
  date: Date;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: IWalletTransaction[];
  autoRecharge: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  cardDetails?: {
    number?: string;
    expiry?: string;
    cvv?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String, required: true },
  referenceId: { type: String },
  date: { type: Date, default: Date.now }
});

const WalletSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [WalletTransactionSchema],
  autoRecharge: {
    enabled: { type: Boolean, default: false },
    threshold: { type: Number, default: 200 },
    amount: { type: Number, default: 500 }
  },
  cardDetails: {
    number: { type: String },
    expiry: { type: String },
    cvv: { type: String }
  }
}, {
  timestamps: true
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);
