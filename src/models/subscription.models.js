import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // One who is Subscribing
        ref: 'User'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // One to whom Subscriber is subscribing
        ref: 'User'
    },
}, {timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;