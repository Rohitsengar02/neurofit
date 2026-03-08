export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  patients: string;
  bio: string;
  image: string;
  hospital: string;
  fee: number;
  availableDays: string[];
  slots: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
}

export const doctorsData: Doctor[] = [
  {
    id: 'dr-marcus',
    name: 'Dr. Marcus',
    specialty: 'Neurology',
    experience: '5 years experience',
    rating: 4.8,
    reviews: 120,
    patients: '1.2k+',
    bio: 'Dr. Marcus is a highly experienced Neurologist focusing on cognitive health and brain performance optimized for performance athletes.',
    image: 'https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png',
    hospital: 'NeuroFit Medical Center',
    fee: 150,
    availableDays: ['Mon', 'Wed', 'Fri'],
    slots: {
      morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
      afternoon: ['01:30 PM', '02:30 PM', '04:00 PM'],
      evening: ['06:00 PM', '07:30 PM']
    }
  },
  {
    id: 'dr-sarah',
    name: 'Dr. Sarah',
    specialty: 'Cardiology',
    experience: '8 years experience',
    rating: 4.9,
    reviews: 210,
    patients: '2.5k+',
    bio: 'Specialist in sports cardiology, Dr. Sarah helps athletes monitor and improve their heart health through optimized training regimens.',
    image: 'https://t3.ftcdn.net/jpg/06/48/69/42/360_F_648694278_haC94bdL26EedqLMIbMpLACqzxwuvq4f.jpg',
    hospital: 'HeartSync Clinic',
    fee: 180,
    availableDays: ['Tue', 'Thu', 'Sat'],
    slots: {
      morning: ['08:00 AM', '09:30 AM', '11:00 AM'],
      afternoon: ['01:00 PM', '03:00 PM', '05:00 PM'],
      evening: ['06:30 PM', '08:00 PM']
    }
  },
  {
    id: 'dr-sameer',
    name: 'Dr. Sameer Khan',
    specialty: 'Orthopedist',
    experience: '12 years experience',
    rating: 4.7,
    reviews: 350,
    patients: '4.8k+',
    bio: 'Expert in spinal health and orthopedic surgery. Focuses on non-invasive recovery for performance-related injuries.',
    image: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlNl9hX3Bob3RvX29mX2FfbWlkZGxlX2FnZV9tYWxlX2luZGlhbl9kb2N0b3JfaXNvbF8wZTAzNGE0YS1iMWU1LTQxOTEtYmU0Zi1iYmE2NWJkMjNmMmEucG5n.png',
    hospital: 'Apex Ortho Center',
    fee: 200,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slots: {
      morning: ['10:00 AM', '11:00 AM', '11:30 AM'],
      afternoon: ['01:00 PM', '02:00 PM', '04:00 PM'],
      evening: ['05:00 PM', '06:00 PM']
    }
  }
];
