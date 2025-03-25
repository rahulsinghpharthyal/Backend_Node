import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary Url
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary Url
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      requried: true,
    },
    duration: {
      type: Number, // the duration from cloudinary
      requried: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);

export default Video;
