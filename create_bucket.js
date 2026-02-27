const postgres = require('postgres');

async function createBucket() {
    const sql = postgres(process.env.DATABASE_URL);

    try {
        console.log("Creating bucket 'antique-images'...");

        // Create the bucket in the storage.buckets table
        await sql`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('antique-images', 'antique-images', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `;
        console.log("Bucket created successfully.");
    } catch (error) {
        console.error("Error creating bucket:", error);
    } finally {
        await sql.end();
    }
}

createBucket();
