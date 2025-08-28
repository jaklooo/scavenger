import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { config } from 'dotenv';

// Načítanie environment premenných
config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase config loaded');
console.log('📁 Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const timestamp = Date.now();
  const adminEmail = `admin${timestamp}@fsvuk.test`;
  const adminPassword = 'fsv12345';
  
  try {
    console.log('🔧 Creating fresh admin user...');
    console.log('📧 Using email:', adminEmail);
    
    // Vytvorenie nového používateľa s unikátnym emailom
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ New admin user created in Firebase Auth');
    
    // Vytvorenie admin záznamu v Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      displayName: 'FSV System Administrator',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Admin user document created in Firestore');
    console.log('🎯 ADMIN LOGIN CREDENTIALS:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👑 Role: admin');
    console.log('🚀 Ready to access /admin interface!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.code, error.message);
  }
}

createAdminUser();
