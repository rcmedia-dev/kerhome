const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
    console.log("Setting up storage bucket...");

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const existing = buckets.find(b => b.name === 'chat-uploads');

    if (existing) {
        console.log("✅ Bucket 'chat-uploads' already exists.");

        // Update to public just in case
        const { error: updateError } = await supabase.storage.updateBucket('chat-uploads', {
            public: true
        });
        if (updateError) console.error("Error updating bucket public status:", updateError);
        else console.log("✅ Bucket set to public.");

    } else {
        console.log("Creating 'chat-uploads' bucket...");
        const { data, error } = await supabase.storage.createBucket('chat-uploads', {
            public: true
        });

        if (error) {
            console.error("❌ Failed to create bucket:", error);
        } else {
            console.log("✅ Bucket created successfully!");
        }
    }
}

setupStorage();
