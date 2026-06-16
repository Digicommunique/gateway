/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, ShieldAlert, ArrowRight, Stethoscope, FileText, CheckCircle } from "lucide-react";
import { INITIAL_SPECIALTIES } from "../data";

interface TelemetryDiagnosticsProps {
  onSelectRole: (role: "doctor" | "patient" | "admin" | "pharmacy") => void;
}

export default function TelemetryDiagnostics({ onSelectRole }: TelemetryDiagnosticsProps) {
  const [symptomInput, setSymptomInput] = useState("Dry cough, elevated body temperature, throat irritation");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    riskScore: "High" | "Moderate" | "Mild";
    icdCode: string;
    specialtyRef: string;
    analysisText: string;
    recommendations: string[];
  } | null>(null);

  const handleAnalyze = () => {
    if (!symptomInput) return;
    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const lower = symptomInput.toLowerCase();
      let riskScore: "High" | "Moderate" | "Mild" = "Mild";
      let icdCode = "J00 (Common Cold)";
      let specialtyRef = "General Medicine";
      let analysisText = "";
      let recommendations: string[] = [];

      if (lower.includes("chest") || lower.includes("breath") || lower.includes("heart") || lower.includes("cardiac")) {
        riskScore = "High";
        icdCode = "I10 (Primary systemic hypertension / Angina study)";
        specialtyRef = "Cardiology";
        analysisText = "High-risk systemic cardio-respiratory indicators detected. Symptoms of chest pressure or respiratory limits mandate urgent specialist evaluation to prevent secondary distress.";
        recommendations = [
          "Do not engage in physical exertion or high-sodium diet right now.",
          "Check blood pressure and pulse immediately with a digital monitor.",
          "Hold a virtual consult with our empanelled Cardiologist Dr. Rajesh Iyer."
        ];
      } else if (lower.includes("child") || lower.includes("pediatric") || lower.includes("baby") || lower.includes("infant")) {
        riskScore = "Moderate";
        icdCode = "J02.9 (Acute pharyngitis child)";
        specialtyRef = "Pediatrics";
        analysisText = "Moderate-risk pediatric viral indicators identified. Pediatric vitals fluctuate rapidly under seasonal infections.";
        recommendations = [
          "Maintain absolute hydration with warm electrolyte liquids.",
          "Monitor core temperature every 2 hours with digital thermometer.",
          "Schedule virtual consultation with Dr. Preeti Deshmukh."
        ];
      } else {
        riskScore = "Mild";
        icdCode = "J00 (Acute nasopharyngitis - Common Cold)";
        specialtyRef = "General Medicine";
        analysisText = "Mild upper respiratory viral airway congestion. Highly congruent with seasonal changes or localized cough irritation.";
        recommendations = [
          "Perform steam inhalations 3x daily to clear congestion.",
          "Consume warm fluids such as honey-ginger herbal extracts.",
          "Hold virtual check with General Physician Dr. Alok Sharma."
        ];
      }

      setResult({ riskScore, icdCode, specialtyRef, analysisText, recommendations });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl flex flex-col gap-5 shadow-lg" id="telemetry-root">
      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">AI Symptom Checker Console</h3>
            <p className="text-[10px] text-slate-400 font-mono">Triage, Clinical Risk Assessments & Direct Routing</p>
          </div>
        </div>
        <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-mono">
          Model: Clinical-BERT Pre-checked
        </span>
      </div>

      <div className="space-y-4">
        {/* Input box */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase">Input Active Patient symptoms</label>
          <div className="flex gap-2">
            <textarea
              id="input-symptoms-checker"
              rows={2}
              className="flex-1 text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans resize-none"
              placeholder="Describe symptoms here (e.g. Dry cough, low fever, throat pain)..."
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
            />
            <button
              id="btn-analyze-symptoms"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs px-4 rounded-xl transition flex flex-col items-center justify-center gap-1 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Triage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic assessment details */}
        {result && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-inner" id="symptom-checker-results">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Evaluation</span>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                result.riskScore === "High" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                result.riskScore === "Moderate" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              }`}>
                {result.riskScore} Risk Profile
              </span>
            </div>

            <div className="space-y-1.1 text-xs">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Clinical Analysis</p>
              <p className="text-slate-200 leading-relaxed font-sans text-xs">{result.analysisText}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-2.5">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold block">Assumed ICD-10 Code</span>
                <span className="font-mono text-[11px] text-teal-400 mt-1 block">{result.icdCode}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold block">Clinical Specialty</span>
                <span className="font-mono text-[11px] text-teal-400 mt-1 block">{result.specialtyRef}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
              <span className="text-slate-500 text-[9px] uppercase font-bold block">Provisional Health Advice</span>
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-300">
                  <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            {/* Quick action: Route to Doctor appointment */}
            <div className="mt-3 bg-teal-500/10 border border-teal-500/20 p-2.5 rounded-lg flex items-center justify-between text-xs text-teal-400 font-semibold">
              <span className="text-[11px]">Symptom analysis is complete. Select Doctor Consultation.</span>
              <button
                id="btn-triage-route-booking"
                onClick={() => onSelectRole("patient")}
                className="bg-teal-500 text-slate-950 font-black text-[10px] py-1 px-2.5 rounded uppercase tracking-wide flex items-center gap-1 hover:bg-teal-400 transition"
              >
                Book Consult <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-1.5 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-500 leading-relaxed font-mono">
          <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <span>Disclaimer: This machine-generated triage check does not replace physical checks. If experiencing short gasp breaths or chest discomfort, dial national emergency helpline (+91 102/108) immediately.</span>
        </div>
      </div>
    </div>
  );
}
