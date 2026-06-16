/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Appointment, Doctor, ConsultationMode, MedicineEntry, Prescription } from "../types";
import { ICD10_DATABASE, COMPREHENSIVE_DRUG_INTERACTIONS } from "../data";
import { Stethoscope, Users, Radio, Activity, Code, ShieldAlert, Plus, Trash2, Printer, CheckCircle, FileText, Smartphone, AlertCircle, Sparkles } from "lucide-react";

interface DoctorPortalProps {
  doctors: Doctor[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  addRevenue: (consultationFee: number) => void;
}

export default function DoctorPortal({
  doctors,
  appointments,
  setAppointments,
  prescriptions,
  setPrescriptions,
  addRevenue
}: DoctorPortalProps) {
  // Select active logged-in doctor
  const approvedDoctors = doctors.filter((d) => d.status === "Approved");
  const [activeDocId, setActiveDocId] = useState<string>(approvedDoctors[0]?.id || "");
  const activeDoctor = approvedDoctors.find((d) => d.id === activeDocId);

  // Online status
  const [isOnline, setIsOnline] = useState(true);

  // Active appointment selected for examination
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const activeAppt = appointments.find((a) => a.id === activeAppointmentId);

  // Automatically select the first pending appointment if none is active or when doctor changes
  React.useEffect(() => {
    const currentActiveValid = appointments.find(
      (a) => a.id === activeAppointmentId && a.doctorId === activeDocId && (a.status === "Scheduled" || a.status === "In Consultation")
    );
    
    if (!currentActiveValid) {
      const firstPending = appointments.find(
        (a) => a.doctorId === activeDocId && (a.status === "Scheduled" || a.status === "In Consultation")
      );
      
      if (firstPending) {
        setActiveAppointmentId(firstPending.id);
        setChiefComplaint(firstPending.symptoms || "Dry cough, sore throat, mild fever for past 2 days");
        setPresentIllness("Patient has symptoms for last 48 hours. No shortness of breath. Checked on telemedicine portal.");
        setVitals({
          temp: "98.9 °F",
          pulse: "82 bpm",
          bp: "128/84 mmHg",
          spo2: "97%",
          rr: "19 /min"
        });
        if (firstPending.specialty === "Cardiology") {
          setCustomMeds([{ name: "Aspirin", strength: "75mg", dosage: "0-1-0", frequency: "After Food", duration: "15 days", advice: "Do not skip" }]);
          setSelectedIcd("I10");
          setProvisionalDiagnosis("Primary systemic hypertension");
        } else {
          setCustomMeds([{ name: "Paracetamol", strength: "650mg", dosage: "1-0-1", frequency: "After Food", duration: "3 days", advice: "Take only in case of fever" }]);
          setSelectedIcd("J00");
          setProvisionalDiagnosis("Acute viral common cold upper airway");
        }
        setAiAnalysis({ interactions: [], allergyAlerts: [], alternatives: [] });
      } else {
        setActiveAppointmentId(null);
      }
    }
  }, [activeDocId, appointments, activeAppointmentId]);

  // Active patient vital inputs
  const [vitals, setVitals] = useState({
    temp: "98.6 °F",
    pulse: "76 bpm",
    bp: "120/80 mmHg",
    spo2: "98%",
    rr: "18 /min"
  });

  // Clinical Consultation inputs
  const [chiefComplaint, setChiefComplaint] = useState("Dry cough, sore throat, mild fever for past 2 days");
  const [presentIllness, setPresentIllness] = useState("Patient reports sudden onset dry, ticklish cough with throat scratchiness. No shortness of breath yet.");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("Acute upper respiratory infection");
  const [selectedIcd, setSelectedIcd] = useState("J00");
  const [additionalAdvice, setAdditionalAdvice] = useState("Drink plenty of warm fluids. Avoid cold beverages or ice creams.");
  const [dietAdvice, setDietAdvice] = useState("High protein, light cooked meals warm foods");
  const [investigationAdvice, setInvestigationAdvice] = useState<string[]>([]);
  const [followUpDays, setFollowUpDays] = useState("5");

  // Multi-medicine compilation
  const [customMeds, setCustomMeds] = useState<MedicineEntry[]>([
    { name: "Paracetamol", strength: "650mg", dosage: "1-0-1", frequency: "After Food", duration: "3 days", advice: "Take if temperature exceeds 99.5 F" }
  ]);
  const [medInput, setMedInput] = useState({
    name: "",
    strength: "500mg",
    dosage: "1-1-1",
    frequency: "After Food",
    duration: "5 days",
    advice: ""
  });

  // AI assistant simulation alerts state
  const [aiAnalysis, setAiAnalysis] = useState<{
    interactions: string[];
    allergyAlerts: string[];
    alternatives: string[];
  }>({
    interactions: [],
    allergyAlerts: [],
    alternatives: []
  });

  const handleAddMedicine = () => {
    if (!medInput.name) return;
    const added: MedicineEntry = {
      name: medInput.name,
      strength: medInput.strength,
      dosage: medInput.dosage,
      frequency: medInput.frequency,
      duration: medInput.duration,
      advice: medInput.advice
    };
    const updatedMeds = [...customMeds, added];
    setCustomMeds(updatedMeds);
    setMedInput({ name: "", strength: "500g", dosage: "1-0-1", frequency: "After Food", duration: "5 days", advice: "" });
    runAiAudit(updatedMeds);
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = customMeds.filter((_, i) => i !== index);
    setCustomMeds(updated);
    runAiAudit(updated);
  };

  const runAiAudit = (meds: MedicineEntry[]) => {
    if (!activeAppt) return;
    const interactions: string[] = [];
    const allergyAlerts: string[] = [];
    const alternatives: string[] = [];

    // 1. Allergy warnings: Check if drug contains allergy trigger
    const allergiesString = (activeAppt.patientAllergies || []).join(", ").toLowerCase();
    meds.forEach(med => {
      const drugName = med.name.toLowerCase();
      if (allergiesString.includes("penicillin") && (drugName.includes("amoxycillin") || drugName.includes("amoxil") || drugName.includes("penicillin"))) {
        allergyAlerts.push(`PENICILLIN ALLERGY ALERT: ${med.name} is a Beta-lactam antibiotic. Patient declared Penicillin allergy!`);
      }
      if (allergiesString.includes("sulfa") && (drugName.includes("sulfamethoxazole") || drugName.includes("sulpha") || drugName.includes("bactrim"))) {
        allergyAlerts.push(`SULFA DRUG CAUTION: Patient has declared sulfa allergy.`);
      }
    });

    // 2. Drug-to-Drug interaction check
    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const drugA = meds[i].name.toLowerCase();
        const drugB = meds[j].name.toLowerCase();

        COMPREHENSIVE_DRUG_INTERACTIONS.forEach(inter => {
          const checkA = inter.drugA.toLowerCase();
          const checkB = inter.drugB.toLowerCase();
          if ((drugA.includes(checkA) && drugB.includes(checkB)) || (drugA.includes(checkB) && drugB.includes(checkA))) {
            interactions.push(`HIGH RISK INTERACTION: ${inter.drugA} + ${inter.drugB} - ${inter.effect}`);
          }
        });
      }
    }

    // 3. Generic alternatives
    meds.forEach(med => {
      if (med.name.toLowerCase().includes("amoxil") || med.name === "Amoxycillin") {
        alternatives.push(`Cost alternative for Amoxycillin: Recommend generic capsules to save 30% of patient cost.`);
      }
    });

    setAiAnalysis({ interactions, allergyAlerts, alternatives });
  };

  const handleSelectAppointment = (appt: Appointment) => {
    setActiveAppointmentId(appt.id);
    setChiefComplaint(appt.symptoms || "Generalized malaise, fatigue, dry cough");
    setPresentIllness("Patient has symptoms for last 48 hours. No shortness of breath. Checked on telemedicine portal.");
    // Pre-seed matching vitals
    setVitals({
      temp: "98.9 °F",
      pulse: "82 bpm",
      bp: "128/84 mmHg",
      spo2: "97%",
      rr: "19 /min"
    });
    // Set medicine based on specialty
    if (appt.specialty === "Cardiology") {
      setCustomMeds([{ name: "Aspirin", strength: "75mg", dosage: "0-1-0", frequency: "After Food", duration: "15 days", advice: "Do not skip" }]);
      setSelectedIcd("I10");
      setProvisionalDiagnosis("Primary systemic hypertension");
    } else {
      setCustomMeds([{ name: "Paracetamol", strength: "650mg", dosage: "1-0-1", frequency: "After Food", duration: "3 days", advice: "Take only in case of fever" }]);
      setSelectedIcd("J00");
      setProvisionalDiagnosis("Acute viral common cold upper airway");
    }
    setAiAnalysis({ interactions: [], allergyAlerts: [], alternatives: [] });
  };

  const handleAuditDiagnosisWithIcd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedIcd(val);
    const mockMatch = ICD10_DATABASE.find(item => item.code === val);
    if (mockMatch) {
      setProvisionalDiagnosis(mockMatch.name);
    }
  };

  const handleToggleInvestigation = (testName: string) => {
    setInvestigationAdvice(prev =>
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  const handleFinalizePrescription = () => {
    if (!activeDoctor || !activeAppt) return;

    const prescriptionNo = `Rx-${90234 + prescriptions.length}`;
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      appointmentId: activeAppt.id,
      prescriptionNumber: prescriptionNo,
      date: new Date().toISOString().split("T")[0],
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      patientName: activeAppt.patientName,
      patientUHID: activeAppt.patientId,
      vitals: {
        temp: vitals.temp,
        pulse: vitals.pulse,
        bp: vitals.bp,
        spo2: vitals.spo2
      },
      chiefComplaint,
      provisionalDiagnosis,
      icd10Code: selectedIcd,
      medicines: customMeds,
      investigations: investigationAdvice,
      dietAdvice,
      lifestyleAdvice: additionalAdvice,
      qrcode: `VERIFY-SECURE-RX-${prescriptionNo}-${activeDoctor.registrationNumber}`,
      signature: activeDoctor.documents.signature || "Dr_Digital_Verified_SHA256"
    };

    setPrescriptions(prev => [...prev, newRx]);

    // Update appointment status to completed and link prescription
    setAppointments(prev =>
      prev.map(a => a.id === activeAppt.id ? { ...a, status: "Completed", prescriptionId: newRx.id } : a)
    );

    // Credit revenue metrics
    addRevenue(activeDoctor.consultationFee);

    alert(`E-Prescription ${prescriptionNo} secured & sealed! Dispatched via automated SMS/WhatsApp node to Patient.`);
    setActiveAppointmentId(null);
  };

  const docAppointments = appointments.filter((a) => a.doctorId === activeDoctor?.id);
  const queueAppointments = docAppointments.filter((a) => a.status === "Scheduled" || a.status === "In Consultation");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="doctor-portal-root">
      {/* Top Banner and Doctor Switcher */}
      <div className="lg:col-span-12 bg-teal-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md" id="doctor-header-desk">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-7 w-7 text-teal-300 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold font-sans">Empanelled Doctor Consultation Portal</h2>
            <p className="text-xs text-teal-200">Digital Rx & Telemedicine Workstation • Licensed and Signed Environment</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-teal-800 px-3 py-1.5 rounded-xl border border-teal-700">
            <span className="text-xs text-teal-300 mr-2 font-semibold">Active Doctor:</span>
            <select
              id="select-doctor"
              className="text-xs font-bold bg-transparent border-none text-white focus:ring-0 outline-none cursor-pointer"
              value={activeDocId}
              onChange={(e) => {
                setActiveDocId(e.target.value);
                setActiveAppointmentId(null);
              }}
            >
              {approvedDoctors.map(doc => (
                <option key={doc.id} value={doc.id} className="text-slate-800 font-semibold">{doc.name} ({doc.specialty})</option>
              ))}
            </select>
          </div>

          <button
            id="btn-online-toggle"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isOnline ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-700 text-slate-300"
            }`}
          >
            <Radio className="h-4 w-4 animate-ping" />
            <span>{isOnline ? "Online Node" : "Offline Node"}</span>
          </button>
        </div>
      </div>

      {/* Doctor Dashboard Indicators - Left Side */}
      <div className="lg:col-span-3 flex flex-col gap-4" id="doctor-queue-sidebar">
        {/* Statistics panel */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Workstation Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2.5 rounded">
              <span className="text-[10px] text-slate-500">Wait Patients</span>
              <p className="text-xl font-bold text-teal-600 mt-1">{queueAppointments.length}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded">
              <span className="text-[10px] text-slate-500">Earnings</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">₹ {docAppointments.filter(a => a.status === "Completed").length * (activeDoctor?.consultationFee || 0)}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono text-center bg-slate-50 py-1.5 rounded">
            Reg Council: {activeDoctor?.medicalCouncil || "Unverified"}
          </div>
        </div>

        {/* Patients Appointment Queue */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex-1 min-h-[300px]">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Consultation Queue</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{queueAppointments.length} Token</span>
          </h4>

          {queueAppointments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {queueAppointments.map((appt) => (
                <button
                  id={`btn-appt-${appt.id}`}
                  key={appt.id}
                  onClick={() => handleSelectAppointment(appt)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 focus:outline-none ${
                    activeAppointmentId === appt.id
                      ? "bg-teal-50 border-teal-400 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold font-mono text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                      Tk #{appt.tokenNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{appt.timeSlot}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">{appt.patientName}</h5>
                    <p className="text-[11px] text-slate-500">{appt.patientGender}, {appt.patientAge} years</p>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic bg-slate-50 p-1 rounded">Symptom: {appt.symptoms || "General Consulting"}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="h-10 w-10 text-slate-200 stroke-[1.5] mb-2" />
              <p className="text-xs">No pending appointments or patient bookings in your current queue.</p>
            </div>
          )}
        </div>
      </div>

      {/* active Patient consultation suite - Right Side 9 Cols */}
      <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="doctor-consult-board">
        {activeAppt ? (
          <div className="flex flex-col gap-6" id="consult-active-form">
            {/* Patient Header Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {activeAppt.patientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{activeAppt.patientName}</h3>
                  <p className="text-xs text-slate-500">Gender: {activeAppt.patientGender} • Age: {activeAppt.patientAge} yr • EMR ID: <code className="bg-slate-200 px-1 rounded text-[10px] font-mono">{activeAppt.patientId}</code></p>
                </div>
              </div>

              {/* Patient EMR allergies */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-red-50 text-red-800 border border-red-100 p-2 rounded-lg">
                  <span className="font-bold block text-[9px] uppercase text-red-500">Allergies Declared</span>
                  {activeAppt.patientAllergies.length > 0 ? activeAppt.patientAllergies.join(", ") : "No allergies declared"}
                </div>
                <div className="bg-indigo-50 text-indigo-800 border border-indigo-100 p-2 rounded-lg">
                  <span className="font-bold block text-[9px] uppercase text-indigo-500">Chronic comorbidities</span>
                  {activeAppt.patientChronic.length > 0 ? activeAppt.patientChronic.join(", ") : "No known systemic issues"}
                </div>
              </div>
            </div>

            {/* Vitals inputs and Examination details */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-teal-50/25 p-4 rounded-xl border border-teal-100/50">
              <p className="font-bold text-xs text-teal-800 uppercase tracking-wider col-span-1 md:col-span-5 flex items-center gap-1.5 mb-1">
                <Activity className="h-4 w-4" /> Clinical Vitals Panel
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Temp</label>
                <input
                  id="vital-temp"
                  type="text"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded bg-white text-slate-800"
                  value={vitals.temp}
                  onChange={(e) => setVitals(prev => ({ ...prev, temp: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pulse</label>
                <input
                  id="vital-pulse"
                  type="text"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded bg-white text-slate-800"
                  value={vitals.pulse}
                  onChange={(e) => setVitals(prev => ({ ...prev, pulse: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Blood Pressure</label>
                <input
                  id="vital-bp"
                  type="text"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded bg-white text-slate-800"
                  value={vitals.bp}
                  onChange={(e) => setVitals(prev => ({ ...prev, bp: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Oxygen Sat SpO2</label>
                <input
                  id="vital-spo2"
                  type="text"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded bg-white text-slate-800"
                  value={vitals.spo2}
                  onChange={(e) => setVitals(prev => ({ ...prev, spo2: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resp Rate</label>
                <input
                  id="vital-rr"
                  type="text"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded bg-white text-slate-800"
                  value={vitals.rr}
                  onChange={(e) => setVitals(prev => ({ ...prev, rr: e.target.value }))}
                />
              </div>
            </div>

            {/* Diagnosis Entry & E-Medicine prescription desk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical Description Forms */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaint & History</label>
                  <textarea
                    id="complaint-area"
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                  />
                </div>

                {/* ICD-10 Coding assistance */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Code className="h-4 w-4 text-teal-600" />
                      icd-10 diagnosis selector
                    </label>
                    <span className="text-[10px] bg-teal-100 font-mono text-teal-800 px-1.5 py-0.5 rounded font-bold">
                      Code: {selectedIcd}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <select
                      id="select-icd10"
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white"
                      value={selectedIcd}
                      onChange={handleAuditDiagnosisWithIcd}
                    >
                      {ICD10_DATABASE.map(item => (
                        <option key={item.code} value={item.code}>{item.code} - {item.name}</option>
                      ))}
                    </select>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Provisional Clinical Diagnosis</label>
                      <input
                        id="diagnosis-input"
                        type="text"
                        className="w-full text-xs font-medium p-2 border border-slate-200 rounded bg-white text-slate-800"
                        value={provisionalDiagnosis}
                        onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Investigations Recommended (Checkboxes) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Order Diagnostic Investigations</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Complete Blood Count (CBC)", "Diabetes HbA1c Tracker", "Lipid Profile Diagnostic", "Electrocardiogram (ECG)", "Chest X-Ray Digital"].map(test => (
                      <label key={test} className="flex items-center gap-2 cursor-pointer text-slate-600">
                        <input
                          id={`test-checkbox-${test.replace(/\s+/g, '-')}`}
                          type="checkbox"
                          className="rounded text-teal-600 focus:ring-teal-500"
                          checked={investigationAdvice.includes(test)}
                          onChange={() => handleToggleInvestigation(test)}
                        />
                        <span>{test}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medicine Compiler Form */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">Add Medicines for Digital Prescription</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {/* Medicine Name with drug database prompt */}
                    <div className="col-span-3">
                      <input
                        id="input-med-title"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-semibold"
                        placeholder="Drug Generic/Brand (e.g. Amoxycillin)"
                        value={medInput.name}
                        onChange={(e) => setMedInput(prev => ({ ...prev, name: e.target.value }))}
                        list="available-meds-datalist"
                      />
                      <datalist id="available-meds-datalist">
                        <option value="Amoxycillin" />
                        <option value="Aspirin" />
                        <option value="Metformin" />
                        <option value="Paracetamol" />
                        <option value="Atorvastatin" />
                        <option value="Benadryl Formula" />
                      </datalist>
                    </div>
                    <div className="col-span-1.5">
                      <input
                        id="input-med-strength"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-center font-mono"
                        placeholder="Strength"
                        value={medInput.strength}
                        onChange={(e) => setMedInput(prev => ({ ...prev, strength: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-1.5">
                      <input
                        id="input-med-dosage"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-center font-mono"
                        placeholder="Dosage (1-0-1)"
                        value={medInput.dosage}
                        onChange={(e) => setMedInput(prev => ({ ...prev, dosage: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        id="select-med-freq"
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                        value={medInput.frequency}
                        onChange={(e) => setMedInput(prev => ({ ...prev, frequency: e.target.value }))}
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                        <option value="With Milk">With Milk</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        id="input-med-duration"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                        placeholder="Duration (5 days)"
                        value={medInput.duration}
                        onChange={(e) => setMedInput(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        id="btn-add-med-to-list"
                        type="button"
                        onClick={handleAddMedicine}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded flex items-center justify-center gap-1 transition"
                      >
                        <Plus className="h-3 w-3" /> Add Rx
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compiled medicine checklist table */}
                <div className="border border-slate-150 rounded-lg overflow-hidden bg-white max-h-[160px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-mono text-[9px] uppercase border-b border-slate-150 text-slate-500">
                      <tr>
                        <th className="p-2">Rx Medicine</th>
                        <th className="p-2 text-center">Dosage</th>
                        <th className="p-2 text-center">Duration</th>
                        <th className="p-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customMeds.map((med, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-2">
                            <span className="font-bold text-slate-800">{med.name}</span>
                            <span className="block text-[10px] text-slate-500">{med.strength} • {med.frequency}</span>
                          </td>
                          <td className="p-2 text-center font-mono text-slate-700 font-bold">{med.dosage}</td>
                          <td className="p-2 text-center text-slate-600">{med.duration}</td>
                          <td className="p-2 text-right">
                            <button
                              id={`btn-del-med-${index}`}
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4 inline-block" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Prescription Assistant & Alerts Dashboard */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest font-sans">AI Prescription Clinical Guardian</h4>
                </div>
                <span className="text-[9px] font-mono bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded">
                  Checking drug-drug keys & allergies in patient EMR...
                </span>
              </div>

              {aiAnalysis.allergyAlerts.length === 0 && aiAnalysis.interactions.length === 0 && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>No high-risk medication contraindications or historical allergies detected with current prescription list.</span>
                </div>
              )}

              {/* Allergy Warning Cards */}
              {aiAnalysis.allergyAlerts.map((all, i) => (
                <div key={i} className="bg-red-500/15 border-l-4 border-red-500 p-2.5 rounded text-xs flex gap-2 w-full">
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-300">EMR Historical Allergy Caution</p>
                    <p className="text-[11px] text-red-200 mt-0.5">{all}</p>
                  </div>
                </div>
              ))}

              {/* Interactions warnings cards */}
              {aiAnalysis.interactions.map((inter, i) => (
                <div key={i} className="bg-amber-500/15 border-l-4 border-amber-500 p-2.5 rounded text-xs flex gap-2 w-full">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Medication-Medication Interaction Flag</p>
                    <p className="text-[11px] text-amber-200 mt-0.5">{inter}</p>
                  </div>
                </div>
              ))}

              {/* generic alternative advice */}
              {aiAnalysis.alternatives.map((alt, i) => (
                <div key={i} className="bg-teal-500/10 border-l-4 border-teal-500 p-2 text-xs flex gap-2">
                  <Sparkles className="h-4 w-4 text-teal-300 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-teal-200">{alt}</p>
                </div>
              ))}
            </div>

            {/* Bottom Actions Form */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-500 italic flex items-center gap-1">
                <span>By finalizing, the e-Rx is timestamped & sealed with signature credit:</span>
                <strong className="font-mono text-slate-800">{activeDoctor.documents.signature || "Authorized-HSP"}</strong>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  id="btn-consult-cancel"
                  onClick={() => setActiveAppointmentId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex-1 sm:flex-initial"
                >
                  Hold Patient
                </button>
                <button
                  id="btn-consult-finalize"
                  onClick={handleFinalizePrescription}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                >
                  <FileText className="h-4 w-4" /> Finalize Rx & Dispatched
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center p-12 text-slate-400 min-h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=250&auto=format&fit=crop"
              alt="Medical Consultation Workplace"
              className="w-48 h-28 object-cover rounded-xl grayscale opacity-30 shadow-md mb-4"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-lg font-bold text-slate-700">Digital Consultation Deck</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Select an active waiting patient from the token token waitlist queue to load virtual telemedicine suite, entry vitals, and issue sealed e-Prescriptions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
