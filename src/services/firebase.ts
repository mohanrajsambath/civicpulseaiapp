import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ActiveRole, Grievance, UserProfile } from '../types';
import { INITIAL_GRIEVANCES, DEFAULT_USER_PROFILES } from '../data/seedData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with designated database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or network is limited:', error.message);
      return false;
    }
    // Expected if test/connection doesn't exist yet, but server was reached
    return true;
  }
}

// Sign In with Google
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check or create user profile in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnapshot = await getDoc(userDocRef);
    
    let profile: UserProfile;
    
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      profile = {
        id: fbUser.uid,
        name: data.displayName || fbUser.displayName || 'Authenticated User',
        designation: data.designation || 'Citizen User',
        role: (data.role as ActiveRole) || 'civilian',
        emailOrPhone: fbUser.email || data.email || '',
        department: data.department || 'Civilian Community Portal',
        jurisdiction: data.jurisdiction || 'Local Ward',
        clearanceLevel: data.clearanceLevel || 'Tier-1 Authenticated',
        badgeLabel: data.badgeLabel || 'Verified User',
        badgeBg: data.badgeBg || 'bg-teal-500/20 text-teal-300 border-teal-500/40'
      };
    } else {
      // Create new profile with Google Auth defaults
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        designation: 'Citizen Resident',
        role: 'civilian',
        emailOrPhone: fbUser.email || '',
        department: 'Public Grievance Portal',
        jurisdiction: 'Pan-India / Local Ward',
        clearanceLevel: 'Standard Citizen Tier',
        badgeLabel: 'Google Verified Citizen',
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
      };

      await setDoc(userDocRef, {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        role: 'civilian',
        designation: profile.designation,
        department: profile.department,
        jurisdiction: profile.jurisdiction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return { user: fbUser, profile };
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Update User Role & Profile in Firestore
export async function updateUserRoleInFirestore(
  uid: string, 
  role: ActiveRole, 
  details?: {
    firmName?: string;
    licenseNo?: string;
    designation?: string;
    department?: string;
    jurisdiction?: string;
  }
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);
  const existing = userSnap.exists() ? userSnap.data() : {};

  const roleMeta: Record<ActiveRole, { designation: string; department: string; badgeLabel: string; badgeBg: string }> = {
    civilian: {
      designation: 'Verified Citizen Resident',
      department: 'Civilian Community Portal',
      badgeLabel: 'Verified Citizen',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    },
    provider: {
      designation: details?.designation || 'Municipal Field Contractor',
      department: details?.firmName ? `${details.firmName} (PWD Vendor #${details?.licenseNo || 'TN-9021'})` : 'Public Works & Infrastructure Squad',
      badgeLabel: 'Municipal Contractor',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    policymaker: {
      designation: 'District Magistrate / Chief Admin',
      department: details?.department || 'District Administration & Revenue Dept',
      badgeLabel: 'Admin / Magistrate',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    whatsapp: {
      designation: 'WhatsApp Gateway Dispatcher',
      department: 'Vernacular Public Ingestion System',
      badgeLabel: 'WhatsApp Gateway',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }
  };

  const meta = roleMeta[role];

  const updatedData = {
    role,
    designation: meta.designation,
    department: meta.department,
    jurisdiction: details?.jurisdiction || existing.jurisdiction || 'Madurai / Tamil Nadu',
    contractorFirm: details?.firmName || existing.contractorFirm || null,
    contractorLicenseNo: details?.licenseNo || existing.contractorLicenseNo || null,
    updatedAt: new Date().toISOString()
  };

  await setDoc(userDocRef, updatedData, { merge: true });

  return {
    id: uid,
    name: existing.displayName || auth.currentUser?.displayName || 'User',
    designation: meta.designation,
    role,
    emailOrPhone: auth.currentUser?.email || existing.email || '',
    department: meta.department,
    jurisdiction: updatedData.jurisdiction,
    clearanceLevel: role === 'policymaker' ? 'Tier-1 Executive Admin' : role === 'provider' ? 'Field Contractor Auth' : 'Verified Resident Tier',
    badgeLabel: meta.badgeLabel,
    badgeBg: meta.badgeBg
  };
}

// Sync Grievances from Firestore with real-time listener
export function subscribeToGrievances(
  onGrievancesUpdated: (grievances: Grievance[]) => void
) {
  const grievancesCol = collection(db, 'grievances');
  const q = query(grievancesCol, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // If collection is fresh, bootstrap with initial demo seeds
      bootstrapInitialGrievances();
      onGrievancesUpdated(INITIAL_GRIEVANCES);
    } else {
      const items: Grievance[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Grievance), id: docSnap.id });
      });
      onGrievancesUpdated(items);
    }
  }, (error) => {
    console.warn('Firestore subscription fallback to local state:', error);
    onGrievancesUpdated(INITIAL_GRIEVANCES);
  });
}

// Seed initial grievances in Firestore if empty
export async function bootstrapInitialGrievances() {
  try {
    const grievancesCol = collection(db, 'grievances');
    const batch = writeBatch(db);
    
    INITIAL_GRIEVANCES.forEach((g) => {
      const docRef = doc(grievancesCol, g.id);
      batch.set(docRef, g, { merge: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Error bootstrapping initial grievances:', err);
  }
}

// Save a new grievance to Firestore
export async function saveGrievanceToFirestore(grievance: Grievance): Promise<void> {
  try {
    const docRef = doc(db, 'grievances', grievance.id);
    await setDoc(docRef, grievance);
  } catch (err) {
    console.error('Error saving grievance to Firestore:', err);
    throw err;
  }
}

// Update existing grievance in Firestore
export async function updateGrievanceInFirestore(
  id: string, 
  updates: Partial<Grievance>
): Promise<void> {
  try {
    const docRef = doc(db, 'grievances', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating grievance in Firestore:', err);
    throw err;
  }
}
