/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EmpanelmentStatus {
  PENDING = "Pending",
  UNDER_REVIEW = "Under Review",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  SUSPENDED = "Suspended",
}

export enum ConsultationMode {
  VIDEO = "Video",
  AUDIO = "Audio",
  CHAT = "Chat",
  PHYSICAL = "Physical Clinic Visit",
}

export interface Doctor {
  id: string;
  name: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  photoUrl: string;
  specialty: string;
  qualification: string;
  registrationNumber: string;
  medicalCouncil: string;
  experience: number;
  clinicName: string;
  clinicAddress: string;
  city: string;
  state: string;
  pincode: string;
  status: EmpanelmentStatus;
  documents: {
    mbbs: boolean;
    mdms: boolean;
    registration: boolean;
    aadhaar: boolean;
    pan: boolean;
    signature: string;
  };
  consultationFee: number;
  createdByAdmin?: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  consultationFeeRange: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdByAdmin?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  gstNumber: string;
  ownerName: string;
  contact: string;
  address: string;
  city: string;
  status: "Approval Pending" | "Active" | "Rejected";
  distanceFromPatient?: number; // Simulated in miles/km
  rating: number;
  isPreferred?: boolean;
  commissionRate: number; // e.g., 8 for 8%
  createdByAdmin?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  category: "Medicines" | "OTC" | "Surgical Items" | "Health Devices" | "Ayurvedic" | "Supplements";
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
  description: string;
  prescriptionRequired: boolean;
  stock: number;
  createdByAdmin?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientAllergies: string[];
  patientChronic: string[];
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  mode: ConsultationMode;
  status: "Scheduled" | "In Consultation" | "Completed" | "Cancelled";
  vitals?: {
    temp: string;
    pulse: string;
    bp: string;
    spo2: string;
    rr: string;
  };
  symptoms?: string;
  prescriptionId?: string;
  tokenNumber: number;
}

export interface MedicineEntry {
  name: string;
  strength: string;
  dosage: string; // e.g. "1-0-1"
  frequency: string; // e.g. "After Food"
  duration: string; // e.g. "5 days"
  advice: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  prescriptionNumber: string;
  date: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientUHID: string;
  vitals: {
    temp: string;
    pulse: string;
    bp: string;
    spo2: string;
  };
  chiefComplaint: string;
  provisionalDiagnosis: string;
  icd10Code: string;
  medicines: MedicineEntry[];
  investigations: string[];
  dietAdvice: string;
  lifestyleAdvice: string;
  followUpDate?: string;
  qrcode: string;
  signature: string;
}

export interface Order {
  id: string;
  patientName: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  uploadedPrescriptionUrl?: string;
  allocatedPharmacyId?: string;
  allocatedPharmacyName?: string;
  routingLogic?: {
    reason: string;
    priorityOrder: string[];
  };
  status: "Pending Allocation" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
  deliveryOTP?: string;
  deliveryPartnerName?: string;
  commissionPlatform: number;
  commissionPharmacy: number;
}

export interface AdCampaign {
  id: string;
  title: string;
  advertiser: string;
  type: "Banner Ad" | "Featured Doctor" | "Sponsored Product";
  imageUrl: string;
  targetLink: string;
  impressions: number;
  clicks: number;
  createdByAdmin?: boolean;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  type: "Hired Rider" | "Approved Courier Agency";
  contact: string;
  status: "Available" | "On Trip" | "Inactive";
  vehicle: string;
  agency: string;
  rating: number;
  createdByAdmin?: boolean;
}
