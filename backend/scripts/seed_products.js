require('dotenv').config();
const { db } = require('../config/firebase');

const PRODUCT_LIST = [
    "STELLAR 3.0 - SX60L 3.0",
    "STELLAR 3.0 - SX60LS 3.0",
    "STELLAR 3.0 - SQ50L 3.0",
    "STELLAR 3.0- SQ35L 3.0",
    "STELLAR 3.0- SH50L 3.0",
    "STELLAR 3.0- SH35L 3.0",
    "STELLAR 3.0- SH35 3.0",
    "CONDOR - CQ50L 2.0",
    "CONDOR - CQ35L 2.0",
    "CONDOR- CH35L",
    "CONDOR - CH25L",
    "HABROK - HX60L 4K",
    "HABROK - HX60LS 4K",
    "HABROK -HQ50L",
    "HABROK - HQ35L 4K",
    "HABROK - HH35L 4K",
    "HABROK -HE25L 4K",
    "LYNX 3.0 LH35 3.0",
    "LYNX 3.0 LH25 3.0",
    "LYNX 3.0 LH19 3.0",
    "LYNX 3.0 LH15 3.0",
    "LYNX 3.0 LE15 3.0",
    "LYNX 3.0 LE10 3.0",
    "LYNX 2.0 - LH35 2.0",
    "LYNX 2.0 - LH25 2.0",
    "LYNX 2.0 - LH19 2.0",
    "LYNX 2.0 - LH15 2.0",
    "LYNX S - LE15 S",
    "LYNX S - LE10 S",
    "LYNX S - LC06 S",
    "FALCON - FQ50L 2.0",
    "FALCON -FQ50 2.0",
    "FALCON - FQ35 2.0",
    "FALCON - FQ25",
    "FALCON - FH35",
    "FALCON - FH25",
    "PANTHER 2.0 PQ50L 2.0",
    "PANTHER 2.0 PQ35L 2.0",
    "PANTHER 2.0 PH50L 2.0",
    "PANTHER 2.0 PH35L 2.0",
    "THUNDER 2.0 TQ50 2.0",
    "THUNDER 2.0 TQ35 2.0",
    "THUNDER 2.0 TH35P 2.0",
    "THUNDER 2.0 TH25P 2.0",
    "THUNDER 2.0 TE25 2.0",
    "THUNDER 2.0 TE19 2.0",
    "THUNDER ZOOM 2.0 TQ60Z 2.0",
    "THUNDER ZOOM 2.0 TH50Z 2.0",
    "THUNDER 3.0 TQ50CL 3.0",
    "THUNDER 3.0 TQ50C 3.0",
    "THUNDER 3.0 TQ35C 3.0",
    "THUNDER 3.0 TH35C 3.0",
    "ALPEX 4K A50EL KIT",
    "ALPEX 4K A50EL",
    "ALPEX 4K A50E KIT",
    "ALPEX 4K A50E",
    "ALPEX LITE A40EL KIT TH4",
    "ALPEX LITE A40EL + M4-IR850 Mini 250m Black Light (18350) + Bracket",
    "ALPEX LITE A40EL",
    "ALPEX LITE A40E KIT TH4",
    "ALPEX LITE A40E + M4-IR850 Mini 250m Black Light (18350) + Bracket",
    "ALPEX LITE A40E",
    "ALPEX A50T-S KIT",
    "ALPEX A50T-S",
    "CHEETAH C32FSL KIT",
    "CHEETAH C32FS KIT",
    "M15 TRAIL CAMERA",
    "M15 SP5000",
    "M15 TRAIL CAMERA + SD card with SP5000",
    "EXPLORER",
    "M4-IR850 Mini 250m Black Light (18350)",
    "M4-IR850 Mini 250m Black Light (18350) + Bracket"
];

async function seedProducts() {
    const batch = db.batch();
    const collectionRef = db.collection('products');

    console.log('Starting seed...');

    // Check if products exist to avoid dupes (optional, but good for safety)
    // For simplicity, we'll just add them. Firestore auto-ids will be unique.
    // If you want to prevent duplicates, you'd check first.
    // Let's assume this is a one-time run or we want to overwrite/merge.
    // Actually, let's check one by one or just add if empty.

    // For this task, getting them in is key.

    let count = 0;
    for (const name of PRODUCT_LIST) {
        // simple check
        const existing = await collectionRef.where('name', '==', name).limit(1).get();
        if (existing.empty) {
            const docRef = collectionRef.doc();
            batch.set(docRef, { name, createdAt: new Date().toISOString() });
            count++;
        }
    }

    await batch.commit();
    console.log(`Seeded ${count} products.`);
    process.exit(0);
}

seedProducts().catch(console.error);
