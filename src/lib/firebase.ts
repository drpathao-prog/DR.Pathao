import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Recaptcha
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with getPhoneNumber
    }
  });
};

export const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  const isPlaceholder = firebaseConfig.projectId.includes('remixed-') || firebaseConfig.apiKey.includes('remixed-');
  if (isPlaceholder) {
    throw new Error("Phone login is not available in Demo Mode. Please set up a real Firebase project.");
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Phone Auth Error:', error);
    throw error;
  }
};

const createUserProfile = async (user: FirebaseUser, name?: string) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      id: user.uid,
      name: name || user.displayName || 'No Name',
      email: user.email || 'No Email',
      avatar: user.photoURL || '',
      role: 'patient',
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

export const signInWithGoogle = async () => {
  const isPlaceholder = firebaseConfig.projectId.includes('remixed-') || firebaseConfig.apiKey.includes('remixed-');
  
  if (isPlaceholder) {
    const error = new Error("DR.Pathao is in Demo Mode. Please use the 'Set up Firebase' tool in the sidebar to connect your real Firebase project and fix the API key error.");
    console.error(error.message);
    throw error;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Auth Error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const isPlaceholder = firebaseConfig.projectId.includes('remixed-') || firebaseConfig.apiKey.includes('remixed-');
  if (isPlaceholder) {
    throw new Error("Email signup is not available in Demo Mode. Please set up a real Firebase project.");
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update local profile immediately
    await updateProfile(result.user, { displayName: name });
    
    // Pass the name explicitly to be 100% sure it's used for the Firestore profile
    await createUserProfile(result.user, name);
    
    try {
      await sendEmailVerification(result.user);
    } catch (ve) {
      console.warn('Could not send verification email:', ve);
    }
    return result.user;
  } catch (error) {
    console.error('Sign Up Error:', error);
    throw error;
  }
};

export const resendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const isPlaceholder = firebaseConfig.projectId.includes('remixed-') || firebaseConfig.apiKey.includes('remixed-');
  if (isPlaceholder) {
    throw new Error("Email login is not available in Demo Mode. Please set up a real Firebase project.");
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Ensure profile exists (self-healing if signup process was interrupted)
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Sign In Error:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
  const userDocRef = doc(db, 'users', uid);
  try {
    await setDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // If name is updated, also update Firebase Auth profile for consistency
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  // Check if we are using placeholder values from a remix
  const isPlaceholder = firebaseConfig.projectId.includes('remixed-') || firebaseConfig.apiKey.includes('remixed-');
  
  if (isPlaceholder) {
    console.info("Firebase is in 'Demo Mode' with placeholder configuration. Please use the 'Set up Firebase' tool to connect a real database.");
    return;
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('permission-denied'))) {
      console.warn("Firebase connection failed: The project may not have a Firestore database provisioned yet.");
    }
  }
}
testConnection();
