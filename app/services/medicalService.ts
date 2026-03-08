import { db, auth } from '../utils/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

export interface Appointment {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // ISO string or Timestamp
  slot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: string;
  fee: number;
  createdAt: any;
}

export interface DoctorApplication {
  userId: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
}

// Book an appointment
export const bookAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Authentication required');

    const appointmentRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentRef, {
      ...appointmentData,
      createdAt: Timestamp.now(),
    });

    console.log('Appointment booked with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

// Get user appointments
export const getUserAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

// Get doctor appointments (for the doctor panel)
export const getDoctorAppointments = async (doctorId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'), 
      where('doctorId', '==', doctorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Submit doctor application
export const submitDoctorApplication = async (application: Omit<DoctorApplication, 'status' | 'submittedAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Authentication required');

    const appRef = collection(db, 'doctor_applications');
    await addDoc(appRef, {
      ...application,
      status: 'pending',
      submittedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error submitting doctor application:', error);
    throw error;
  }
};
