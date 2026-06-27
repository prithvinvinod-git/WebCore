import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const firebaseAdminConfig = process.env.FIREBASE_PRIVATE_KEY
  ? {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    }
  : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "webcore-3baa9" }

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
export const db = getFirestore(app)
