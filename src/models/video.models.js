import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        reqired: true,

    },
    thumbnail: {
        type: String,
        reqired: true,
    },
    title: {
        type: String,
        reqired: true,
    },
    description: {
        type: String,
        reqired: true,
    },
    duration: {
        type: Number,//cloudinary 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Type.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);


export const Video = mongoose.model("Video", videoSchema);