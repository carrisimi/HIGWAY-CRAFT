import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  collection,
  serverTimestamp,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration — Firestore client is offline.');
      return false;
    }
    return true;
  }
}

export async function signInWithGoogle() {
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return cred.user;
}

export async function signOutGoogle() {
  await signOut(auth);
}

export interface CloudProgressSnapshot {
  theoryBestPercent: number | null;
  theoryPassed: boolean;
  hazardBestScore: number | null;
  hazardMaxScore: number;
  practicalPasses: number;
  practicalRuns: number;
}

function clampString(val: string | null | undefined, maxLen: number, fallback: string): string {
  const clean = (val ?? '').trim();
  if (!clean) return fallback;
  return clean.slice(0, maxLen);
}

export async function getUserProgressFromFirestore(user: User): Promise<CloudProgressSnapshot | null> {
  try {
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      theoryBestPercent: typeof data.theoryBestPercent === 'number' ? data.theoryBestPercent : null,
      theoryPassed: Boolean(data.theoryPassed),
      hazardBestScore: typeof data.hazardBestScore === 'number' ? data.hazardBestScore : null,
      hazardMaxScore: typeof data.hazardMaxScore === 'number' ? data.hazardMaxScore : 50,
      practicalPasses: typeof data.practicalPasses === 'number' ? data.practicalPasses : 0,
      practicalRuns: typeof data.practicalRuns === 'number' ? data.practicalRuns : 0,
    };
  } catch (err) {
    console.warn('Could not restore cloud learner progress:', err);
    throw err;
  }
}

export async function syncUserProfileToFirestore(
  user: User,
  progress: CloudProgressSnapshot
): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    const displayName = clampString(user.displayName || 'UK Learner', 100, 'UK Learner');
    const theoryBestPercent =
      progress.theoryBestPercent === null
        ? 0
        : Math.max(0, Math.min(100, Math.round(progress.theoryBestPercent)));
    const hazardMaxScore = Math.max(50, Math.min(100, Math.round(progress.hazardMaxScore)));
    const hazardBestScore =
      progress.hazardBestScore === null
        ? 0
        : Math.max(0, Math.min(hazardMaxScore, Math.round(progress.hazardBestScore)));
    const practicalPasses = Math.max(0, Math.min(10000, Math.round(progress.practicalPasses)));
    const practicalRuns = Math.max(
      practicalPasses,
      Math.min(10000, Math.round(progress.practicalRuns))
    );

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        displayName,
        role: 'learner',
        theoryBestPercent,
        theoryPassed: Boolean(progress.theoryPassed),
        hazardBestScore,
        hazardMaxScore,
        practicalPasses,
        practicalRuns,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        ref,
        {
          displayName,
          theoryBestPercent,
          theoryPassed: Boolean(progress.theoryPassed),
          hazardBestScore,
          hazardMaxScore,
          practicalPasses,
          practicalRuns,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function recordAttemptInFirestore(
  user: User,
  attempt: {
    mode: 'theory' | 'hazard' | 'practical';
    topicOrScenario: string;
    score: number;
    maxScore: number;
    passed: boolean;
    minorFaults?: number;
  }
): Promise<void> {
  const path = `users/${user.uid}/attempts`;
  try {
    await addDoc(collection(db, 'users', user.uid, 'attempts'), {
      uid: user.uid,
      mode: attempt.mode,
      topicOrScenario: clampString(attempt.topicOrScenario, 120, 'Practice Session'),
      score: Math.max(0, Math.min(1000, Math.round(attempt.score))),
      maxScore: Math.max(1, Math.min(1000, Math.round(attempt.maxScore))),
      passed: Boolean(attempt.passed),
      minorFaults: Math.max(0, Math.min(100, Math.round(attempt.minorFaults ?? 0))),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}
