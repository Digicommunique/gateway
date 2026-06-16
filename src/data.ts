/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Doctor, Specialty, Pharmacy, Product, EmpanelmentStatus, AdCampaign } from "./types";

export const INITIAL_CITIES = [
  "Mumbai",
  "Bengaluru",
  "New Delhi",
  "Pune",
  "Hyderabad",
  "Kolkata",
  "Chennai"
];

export const INITIAL_SPECIALTIES: Specialty[] = [
  {
    id: "spec-1",
    name: "General Medicine",
    description: "Primary care, seasonal infections, general health advice, chronic disease guidance.",
    consultationFeeRange: "₹300 - ₹600",
    displayOrder: 1,
    status: "Active",
    createdByAdmin: true
  },
  {
    id: "spec-2",
    name: "Pediatrics",
    description: "Child growth monitoring, vaccination, pediatric chronic disease care, infant nutrition.",
    consultationFeeRange: "₹400 - ₹800",
    displayOrder: 2,
    status: "Active"
  },
  {
    id: "spec-3",
    name: "Cardiology",
    description: "Hypertension, ischemic heart diseases, chest tightness, heart failure advice.",
    consultationFeeRange: "₹600 - ₹1200",
    displayOrder: 3,
    status: "Active"
  },
  {
    id: "spec-4",
    name: "Dermatology",
    description: "Allergic rashes, eczema, acne, hair fall, fungal skin infections, psoriasis control.",
    consultationFeeRange: "₹450 - ₹900",
    displayOrder: 4,
    status: "Active"
  },
  {
    id: "spec-5",
    name: "Gynecology",
    description: "Antenatal checkups, hormonal balances, PCOS management, menstrual disorders.",
    consultationFeeRange: "₹500 - ₹1000",
    displayOrder: 5,
    status: "Active"
  },
  {
    id: "spec-6",
    name: "Orthopedics",
    description: "Back pain, joint arthralgia, bone density concerns, ligament sprains.",
    consultationFeeRange: "₹400 - ₹900",
    displayOrder: 6,
    status: "Active"
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "DOC-0021",
    name: "Dr. Alok Sharma",
    gender: "Male",
    dob: "1983-04-12",
    mobile: "+91 98765 12345",
    email: "dr.aloksharma@empanell.org",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
    specialty: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    registrationNumber: "MCI-48119",
    medicalCouncil: "Medical Council of India",
    experience: 15,
    clinicName: "Sharma Health Clinic",
    clinicAddress: "Metro Building, Suite 305, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    status: EmpanelmentStatus.APPROVED,
    createdByAdmin: true,
    documents: {
      mbbs: true,
      mdms: true,
      registration: true,
      aadhaar: true,
      pan: true,
      signature: "Alok_Sharma_MD_Digital"
    },
    consultationFee: 499
  },
  {
    id: "DOC-1094",
    name: "Dr. Preeti Deshmukh",
    gender: "Female",
    dob: "1988-09-24",
    mobile: "+91 91234 56789",
    email: "dr.preeti@empanell.org",
    photoUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200&auto=format&fit=crop",
    specialty: "Pediatrics",
    qualification: "MBBS, DCH (Diploma in Child Health)",
    registrationNumber: "MMC-2012-09432",
    medicalCouncil: "Maharashtra Medical Council",
    experience: 11,
    clinicName: "Caring hands Kinder-Clinic",
    clinicAddress: "Orchid Avenue, Baner",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411045",
    status: EmpanelmentStatus.APPROVED,
    documents: {
      mbbs: true,
      mdms: true,
      registration: true,
      aadhaar: true,
      pan: true,
      signature: "Preeti_Deshmukh_Pediatric_Signed"
    },
    consultationFee: 550
  },
  {
    id: "DOC-2810",
    name: "Dr. Rajesh Iyer",
    gender: "Male",
    dob: "1975-06-18",
    mobile: "+91 88877 66554",
    email: "dr.rajesh.iyer@cardio.com",
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    registrationNumber: "TNM-55342",
    medicalCouncil: "Tamil Nadu Medical Council",
    experience: 22,
    clinicName: "HeartCare Center",
    clinicAddress: "No. 12, Besant Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600090",
    status: EmpanelmentStatus.APPROVED,
    documents: {
      mbbs: true,
      mdms: true,
      registration: true,
      aadhaar: true,
      pan: true,
      signature: "R_Iyer_Cardio_Sig"
    },
    consultationFee: 950
  },
  {
    id: "DOC-PENDING-01",
    name: "Dr. Sunita Sen",
    gender: "Female",
    dob: "1985-02-15",
    mobile: "+91 77766 55443",
    email: "dr.sunita.sen@yahoo.com",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
    specialty: "Gynecology",
    qualification: "MBBS, MS (Obstetrics & Gynecology)",
    registrationNumber: "WMC-19543",
    medicalCouncil: "West Bengal Medical Council",
    experience: 14,
    clinicName: "Sen Maternity & Gynec Clinic",
    clinicAddress: "4 A, Salt Lake Sector 1",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    status: EmpanelmentStatus.UNDER_REVIEW,
    documents: {
      mbbs: true,
      mdms: true,
      registration: true,
      aadhaar: true,
      pan: false,
      signature: "S_Sen_Gynec_Digital_Signed"
    },
    consultationFee: 700
  },
  {
    id: "DOC-PENDING-02",
    name: "Dr. Vikram Mehra",
    gender: "Male",
    dob: "1991-11-30",
    mobile: "+91 90088 12345",
    email: "dr.vmehra@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=200&auto=format&fit=crop",
    specialty: "Dermatology",
    qualification: "MBBS, DDVL (Dermatology)",
    registrationNumber: "DMC-9815",
    medicalCouncil: "Delhi Medical Council",
    experience: 6,
    clinicName: "Vikram's Aesthetic Skin clinic",
    clinicAddress: "F-10, Greater Kailash 1",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110048",
    status: EmpanelmentStatus.PENDING,
    documents: {
      mbbs: true,
      mdms: false,
      registration: true,
      aadhaar: true,
      pan: true,
      signature: ""
    },
    consultationFee: 450
  }
];

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: "PHARM-01",
    name: "Apollo Pharmacy Store #12",
    licenseNumber: "DL-20B-772412",
    gstNumber: "29AAAAA0000A1Z1",
    ownerName: "Apollo Hospital Group",
    contact: "+91 99000 88771",
    address: "Upper Ground, Central Mall, MG Road",
    city: "Bengaluru",
    status: "Active",
    distanceFromPatient: 1.2,
    rating: 4.8,
    isPreferred: true,
    commissionRate: 10,
    createdByAdmin: true
  },
  {
    id: "PHARM-02",
    name: "MedPlus Drugstore Viman Nagar",
    licenseNumber: "MH-PUN-334112",
    gstNumber: "27BBBBB1111B2Z2",
    ownerName: "MedPlus Corp Ltd",
    contact: "+91 94220 54100",
    address: "Shop No. 5, Silver Crest heights, Viman Nagar",
    city: "Pune",
    status: "Active",
    distanceFromPatient: 2.8,
    rating: 4.2,
    isPreferred: false,
    commissionRate: 8
  },
  {
    id: "PHARM-03",
    name: "Wellness Forever 24x7 chemist",
    licenseNumber: "MH-MUM-480991",
    gstNumber: "27ZZZZZ9999Z9Z9",
    ownerName: "Gulshan Mehta",
    contact: "+91 98200 45432",
    address: "Block B, Girdhar Mansion, Bandra West",
    city: "Mumbai",
    status: "Active",
    distanceFromPatient: 3.5,
    rating: 4.6,
    isPreferred: false,
    commissionRate: 12
  },
  {
    id: "PHARM-04",
    name: "Metro Medicos Green Park",
    licenseNumber: "DL-SZ-10143",
    gstNumber: "07CCCCC2222C3Z3",
    ownerName: "Sumit Khurana",
    contact: "+91 85550 49102",
    address: "H-18, Green Park Main Market",
    city: "New Delhi",
    status: "Active",
    distanceFromPatient: 0.5,
    rating: 4.9,
    isPreferred: true,
    commissionRate: 15
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Prescription required Medicines
  {
    id: "PROD-001",
    name: "Amoxycillin 500mg (Amoxil)",
    brand: "GlaxoSmithKline",
    manufacturer: "GSK India Ltd",
    category: "Medicines",
    mrp: 120,
    sellingPrice: 98,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop",
    description: "Broad-spectrum oral antibiotic for bacterial chest, throat, skin, and urinary tract infections.",
    prescriptionRequired: true,
    stock: 250,
    createdByAdmin: true
  },
  {
    id: "PROD-002",
    name: "Metformin ER 500mg (Glycomet)",
    brand: "USV Ltd",
    manufacturer: "USV Pharma Ltd",
    category: "Medicines",
    mrp: 45,
    sellingPrice: 38,
    imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=200&auto=format&fit=crop",
    description: "Extended-release metformin for blood sugar regulation and management of Type 2 Diabetes Mellitus.",
    prescriptionRequired: true,
    stock: 500
  },
  {
    id: "PROD-003",
    name: "Atorvastatin 10mg (Lipvas)",
    brand: "Cipla",
    manufacturer: "Cipla Ltd",
    category: "Medicines",
    mrp: 110,
    sellingPrice: 92,
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=200&auto=format&fit=crop",
    description: "Statins for hypercholesterolemia management and secondary stroke / heart attack protection.",
    prescriptionRequired: true,
    stock: 400
  },
  // OTC Medicines
  {
    id: "PROD-101",
    name: "Paracetamol 650mg (Dolo-650)",
    brand: "Micro Labs",
    manufacturer: "Micro Labs Ltd",
    category: "OTC",
    mrp: 30,
    sellingPrice: 28,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop",
    description: "Analgesic & Antipyretic tablet for fever reduction, moderate body aches, and post-vaccination side effects.",
    prescriptionRequired: false,
    stock: 1000
  },
  {
    id: "PROD-102",
    name: "Benadryl Cough Formula 150ml",
    brand: "Kenvue",
    manufacturer: "Johnson & Johnson Ltd",
    category: "OTC",
    mrp: 145,
    sellingPrice: 132,
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d304f2b23?q=80&w=200&auto=format&fit=crop",
    description: "Soothing cough syrup with diphenhydramine formulation for dry nagging cough & allergic rhinitis.",
    prescriptionRequired: false,
    stock: 120
  },
  // Health Devices
  {
    id: "PROD-201",
    name: "Dr. Trust Automatic BP Monitor",
    brand: "Dr. Trust",
    manufacturer: "Dr. Trust USA Inc",
    category: "Health Devices",
    mrp: 2999,
    sellingPrice: 1999,
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=200&auto=format&fit=crop",
    description: "High-contrast LCD digital upper arm blood pressure monitoring machine with systolic/diastolic pulses.",
    prescriptionRequired: false,
    stock: 45
  },
  {
    id: "PROD-202",
    name: "Pulse Oximeter Finger Sensor",
    brand: "Beurer",
    manufacturer: "Beurer GmbH",
    category: "Health Devices",
    mrp: 1530,
    sellingPrice: 999,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200&auto=format&fit=crop",
    description: "Accurate SpO2 blood oxygen saturation indicator and heart pulse tracker with OLED visual panel.",
    prescriptionRequired: false,
    stock: 60
  },
  // Ayurvedic
  {
    id: "PROD-301",
    name: "Dabur Chyawanprash 2X Double-Immunity",
    brand: "Dabur",
    manufacturer: "Dabur India Ltd",
    category: "Ayurvedic",
    mrp: 380,
    sellingPrice: 349,
    imageUrl: "https://images.unsplash.com/photo-1611079830811-b65d1a64c96e?q=80&w=200&auto=format&fit=crop",
    description: "Ancient clinical recipe of 40 ayurvedic herbs like Amla and Ashwagandha to double respiratory defense.",
    prescriptionRequired: false,
    stock: 180
  }
];

export const INITIAL_CAMPAIGNS: AdCampaign[] = [
  {
    id: "ad-1",
    title: "Protect Your Heart: Free Cardiac Screening Offer",
    advertiser: "Max Super Specialty Hospital",
    type: "Banner Ad",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=500&auto=format&fit=crop",
    targetLink: "https://maxhospital.org/cardiac-package",
    impressions: 4890,
    clicks: 342
  },
  {
    id: "ad-2",
    title: "Consult Eminent Cardiologist Dr. Rajesh Iyer Online",
    advertiser: "HeartCare Center",
    type: "Featured Doctor",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
    targetLink: "cardio-iyer",
    impressions: 1205,
    clicks: 98
  }
];

export const ICD10_DATABASE = [
  { code: "J00", name: "Acute nasopharyngitis [common cold]" },
  { code: "J02.9", name: "Acute pharyngitis, unspecified" },
  { code: "J45.909", name: "Unspecified asthma, uncomplicated" },
  { code: "I10", name: "Essential (primary) hypertension" },
  { code: "E11.9", name: "Type 2 diabetes mellitus without complications" },
  { code: "K21.9", name: "Gastro-esophageal reflux disease without esophagitis" },
  { code: "M25.561", name: "Pain in right knee" },
  { code: "L20.9", name: "Atopic dermatitis, unspecified" },
  { code: "H10.9", name: "Unspecified conjunctivitis" },
  { code: "N39.0", name: "Urinary tract infection, site not specified" }
];

export const COMPREHENSIVE_DRUG_INTERACTIONS = [
  { drugA: "Aspirin", drugB: "Warfarin", severity: "High", effect: "Significantly elevates risk of gastrointestinal bleeding/hemorrhage." },
  { drugA: "Amoxycillin", drugB: "Oral Contraceptives", severity: "Moderate", effect: "May reduce the contraceptive effectiveness of the hormone." },
  { drugA: "Atorvastatin", drugB: "Clarithromycin", severity: "High", effect: "Increases drug concentration, elevating risk of rhabdomyolysis / muscle damage." },
  { drugA: "Metformin", drugB: "Contrast Dye (IV)", severity: "Moderate", effect: "Elevates risk of lactic acidosis. Advise hold drug 48 hours." }
];

export const DEMO_LAB_TESTS = [
  { id: "LAB-T01", name: "Complete Blood Count (CBC) with ESR", provider: "SRL Diagnostics", mrp: 600, price: 349, duration: "6 Hours" },
  { id: "LAB-T02", name: "Lipid Profile (9 Parameters)", provider: "Thyrocare Labs", mrp: 1200, price: 690, duration: "12 Hours" },
  { id: "LAB-T03", name: "HbA1c & Fasting Blood Sugar", provider: "Pathkind Labs", mrp: 750, price: 399, duration: "8 Hours" },
  { id: "LAB-T04", name: "Double Marker & Antenatal Test", provider: "Lal PathLabs", mrp: 2800, price: 1799, duration: "24 Hours" }
];
