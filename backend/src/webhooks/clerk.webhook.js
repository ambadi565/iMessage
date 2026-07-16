import express from 'express';
import User from '../models/user.model.js';
import { verifyWebhook } from '@clerk/backend/webhooks';

const router = express.Router();

router.post('/', async (req, res) => {

    try {

        console.log("Webhook received");
        const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    
        if(!signingSecret) {
            console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set in environment variables");
            res.status(503).json({ message: "Webhook secret is not provided" })
            return;
        }
    
        const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : String(req.body);
        console.log("Payload length:", payload.length);
        
        // clerk verifier expects web request with the raw body; express.raw gives a buffer
        const request = new Request("http://internal/webhooks.clerk", {
            method: "POST",
            header: new Headers(req.headers),
            body: payload
        })
    
        // throws if the signature is wrong or the body was tampered; 
        const evt = await verifyWebhook(request, { signingSecret })
        console.log("Webhook verified, event type:", evt.type, "user ID:", evt.data?.id);
    
        if(evt.type === "user.created" || evt.type === "user.updated") {
            const u = evt.data;
    
            const email = 
                u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
                u.email_addresses?.[0]?.email_address;
    
            const fullName = 
                [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")
                [0];
            
            console.log("Processing user:", { clerkId: u.id, email, fullName });
    
            const result = await User.findOneAndUpdate(
                { clerkId: u.id },
                { clerkId: u.id, email, fullName, profilePic: u.image_url },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            )
            console.log("User saved to database:", result?._id);
        }
    
        if(evt.type === "user.deleted"){
            if(evt.data.id) {
                const result = await User.findOneAndDelete({ clerkId: evt.data.id })
                console.log("User deleted from database:", result?._id);
            }
        }
    
        res.status(200).json({ message: "Webhook received" })
    } 
    catch (e) {
        console.error("Error in Clerk webhook:", e.message);
        console.error("Stack trace:", e.stack);
        res.status(400).json({ message: "Webhook verification Failed" })
    }

});

export default router;