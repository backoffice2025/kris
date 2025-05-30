import { db } from '../../firebase';  // your Firebase config file path
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // ✅ FIXED: Import getAuth
import { mockItemsDatabase } from './mockData';

export async function fetchDepartmentItems(department) {
  try {
    const items = mockItemsDatabase[department] || [];
    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export const submitKRI = async ({ department, date, items }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const submission = {
    department,
    date,
    items,
    approved: false,
    submittedBy: user.email,
    submittedAt: new Date().toISOString(),
  };

  await addDoc(collection(db, "KRI_Submissions"), submission);
};
