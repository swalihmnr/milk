import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRole extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
}

const UserRoleSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true }
}, {
  timestamps: true
});

// Ensure a user can't have duplicate roles of the same type
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export default mongoose.model<IUserRole>('UserRole', UserRoleSchema);
