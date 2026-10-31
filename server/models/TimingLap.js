import mongoose from 'mongoose';

const timingLapSchema = new mongoose.Schema(
  {
    driverName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    carModel: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    bestLapTime: {
      type: String,
      required: true,
      match: [/^[0-5][0-9]:[0-5][0-9]\.[0-9]{3}$/, 'Lap time must use MM:SS.mmm format.'],
      validate: {
        validator: (value) => value !== '00:00.000',
        message: 'Lap time must be greater than zero.',
      },
    },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

timingLapSchema.index({ createdAt: -1 });

export const TimingLap =
  mongoose.models.TimingLap || mongoose.model('TimingLap', timingLapSchema);
