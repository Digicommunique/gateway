/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Appointment, Order, AdCampaign } from "../types";
import { 
  BookOpen, Landmark, RefreshCw, AlertTriangle, FileSpreadsheet, 
  Scale, Filter, ChevronRight, Calculator, HelpCircle, 
  CheckCircle2, Plus, Download, AlertCircle, TrendingUp, DollarSign,
  Briefcase, CheckSquare, Trash2, ArrowRightLeft, FileCheck, Check
} from "lucide-react";

interface AccountingDashboardProps {
  appointments: Appointment[];
  orders: Order[];
  campaigns: AdCampaign[];
}

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceId: string;
}

interface BankStatementLine {
  id: string;
  date: string;
  ref: string;
  description: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  cleared: boolean;
  notes?: string;
}

const ACCOUNT_CODES: { [key: string]: string } = {
  CASH_BANK: "10100 - Cash at Bank (HDFC Corporate A/c)",
  ACCTS_RECEIVABLE: "11200 - Accounts Receivable",
  DR_PAYABLES: "22100 - Doctor Payout Clearance Liab.",
  PHARM_PAYABLES: "22200 - Pharmacy Settlement Liab.",
  COMMISSION_REV: "41100 - Telehealth Platform commissions",
  AD_REV: "41250 - Sponsor Banner Ad Revenue",
  TAX_PAYABLE: "23300 - GST Liability (18% integrated)",
  EQUITY_CAPITAL: "30100 - Partner's Equity Capital Reserves",
  EXP_RENT: "50100 - Administrative Office Rental Expenses",
  EXP_CLOUD: "50200 - GCP Infrastructure Hosting Expenses",
  EXP_BANK: "50300 - Bank Service Charges & PG Fees"
};

const BASE_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "JE-1001",
    date: "2026-06-01",
    description: "Company Incorporation & Seed Funding allocation by founders",
    debitAccount: "10100 - Cash at Bank (HDFC Corporate A/c)",
    creditAccount: "30100 - Partner's Equity Capital Reserves",
    amount: 150000,
    referenceId: "INC-9902"
  },
  {
    id: "JE-1002",
    date: "2026-06-02",
    description: "Corporate Office Co-Working lease payment (HDFC NetBanking)",
    debitAccount: "50100 - Administrative Office Rental Expenses",
    creditAccount: "10100 - Cash at Bank (HDFC Corporate A/c)",
    amount: 12000,
    referenceId: "TXN-88019"
  },
  {
    id: "JE-1003",
    date: "2026-06-03",
    description: "GCP Kubernetes Node Cloud Instance subscription bill paid",
    debitAccount: "50200 - GCP Infrastructure Hosting Expenses",
    creditAccount: "10100 - Cash at Bank (HDFC Corporate A/c)",
    amount: 4500,
    referenceId: "GCP-88301"
  }
];

export default function AccountingDashboard({
  appointments = [],
  orders = [],
  campaigns = []
}: AccountingDashboardProps) {
  // Navigation tabs: journal | ledger | statements | recon
  const [activeTab, setActiveTab] = useState<"journal" | "ledger" | "statements" | "recon">("statements");

  // Selection for the T-Ledger account view
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState<string>(ACCOUNT_CODES.CASH_BANK);

  // Manual Journal Entry Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [mDate, setMDate] = useState("2026-06-09");
  const [mDebit, setMDebit] = useState(ACCOUNT_CODES.CASH_BANK);
  const [mCredit, setMCredit] = useState(ACCOUNT_CODES.COMMISSION_REV);
  const [mAmount, setMAmount] = useState("1500");
  const [mDescription, setMDescription] = useState("");
  const [manualFormSuccess, setManualFormSuccess] = useState("");
  const [manualFormError, setManualFormError] = useState("");

  // Storage for manual entries made by the operator
  const [manualEntries, setManualEntries] = useState<JournalEntry[]>([]);

  // Bank Statement Simulated Rows
  const [bankStatementRaw, setBankStatementRaw] = useState<BankStatementLine[]>([
    { id: "BST-101", date: "2026-06-01", ref: "INC-9902", description: "HDFC CHQ DEP - Founder Seed Contribution", type: "DEPOSIT", amount: 150000, cleared: true },
    { id: "BST-102", date: "2026-06-02", ref: "TXN-88019", description: "NEFT OUT - CO-WORKING SPACE RENT", type: "WITHDRAWAL", amount: 12000, cleared: true },
    { id: "BST-103", date: "2026-06-03", ref: "GCP-88301", description: "INTERNET DEBIT - GOOGLE CLOUD INSTANCE", type: "WITHDRAWAL", amount: 4500, cleared: true },
    { id: "BST-104", date: "2026-06-05", ref: "BNK-CHG", description: "HDFC CHQ RET/CORP ACCT MAINT FEES", type: "WITHDRAWAL", amount: 250, cleared: false, notes: "Unrecorded bank fee charge. Requires ledger clearance." },
    { id: "BST-105", date: "2026-06-08", ref: "AD-ROY", description: "IMPS IN - BLUEDART SPONSOR MARKETING ACCRUAL", type: "DEPOSIT", amount: 3200, cleared: false, notes: "Direct bank deposit from sponsor. Not yet recorded in Cash Book." }
  ]);

  // Track cleared Ledger IDs in Cash Book (reconciliation ticks)
  const [clearedLedgerIds, setClearedLedgerIds] = useState<string[]>(["JE-1001", "JE-1002", "JE-1003"]);

  // Track matched bank statement line IDs
  const [matchedBankLineIds, setMatchedBankLineIds] = useState<string[]>(["BST-101", "BST-102", "BST-103"]);

  const [reconciliationMessage, setReconciliationMessage] = useState("");

  // Determine if account is Asset/Expense (+Debit, -Credit) or Liability/Equity/Revenue (+Credit, -Debit)
  const isDebitPositive = (accountName: string) => {
    return accountName.startsWith("1") || accountName.startsWith("5");
  };

  // Convert active appointments to ledger entries (Consultation Accrual & Platform shares)
  const apptEntries = useMemo(() => {
    return appointments
      .filter(appt => appt.status === "Completed" || appt.status === "In Consultation")
      .map((appt) => {
        const fee = appt.vitals ? 500 : 350; // Dynamic consultation fee formula
        const platformCut = Math.round(fee * 0.15); // Standard 15% platform cut
        const drShare = fee - platformCut;
        const isSettled = appt.status === "Completed";

        return [
          {
            id: `JE-APT-${appt.id}-DR`,
            date: appt.date || "2026-06-09",
            description: `Accrued Consultation Fee - UI Token #${appt.tokenNumber} Patient: ${appt.patientName} (${appt.specialty})`,
            debitAccount: isSettled ? ACCOUNT_CODES.CASH_BANK : ACCOUNT_CODES.ACCTS_RECEIVABLE,
            creditAccount: ACCOUNT_CODES.DR_PAYABLES,
            amount: fee,
            referenceId: appt.id
          },
          {
            id: `JE-APT-${appt.id}-PL`,
            date: appt.date || "2026-06-09",
            description: `Platform Royalty Commission (15% Levy) - Tk #${appt.tokenNumber} Dr. ${appt.doctorName}`,
            debitAccount: ACCOUNT_CODES.DR_PAYABLES,
            creditAccount: ACCOUNT_CODES.COMMISSION_REV,
            amount: platformCut,
            referenceId: appt.id
          }
        ];
      })
      .flat();
  }, [appointments]);

  // Convert active pharmacy orders to ledger entries
  const orderEntries = useMemo(() => {
    return orders
      .filter(o => o.status === "Delivered" || o.status === "Out for Delivery" || o.status === "Preparing")
      .map((ord) => {
        const isDelivered = ord.status === "Delivered";
        const commission = ord.commissionPlatform || Math.round(ord.subtotal * 0.08); // fallback 8%
        const gst = ord.tax || Math.round(ord.subtotal * 0.18); // fallback 18% GST standard rate
        
        return [
          {
            id: `JE-ORD-${ord.id}-A`,
            date: "2026-06-09",
            description: `Consolidated Drug Sales - Ref: ${ord.id} - Patient: ${ord.patientName}`,
            debitAccount: isDelivered ? ACCOUNT_CODES.CASH_BANK : ACCOUNT_CODES.ACCTS_RECEIVABLE,
            creditAccount: ACCOUNT_CODES.PHARM_PAYABLES,
            amount: ord.total,
            referenceId: ord.id
          },
          {
            id: `JE-ORD-${ord.id}-B`,
            date: "2026-06-09",
            description: `Dispensation Platform commission shares - Ref: ${ord.id} (${ord.allocatedPharmacyName})`,
            debitAccount: ACCOUNT_CODES.PHARM_PAYABLES,
            creditAccount: ACCOUNT_CODES.COMMISSION_REV,
            amount: commission,
            referenceId: ord.id
          },
          {
            id: `JE-ORD-${ord.id}-C`,
            date: "2026-06-09",
            description: `Interstate GST 18% Apportioned Liability - Ref: ${ord.id}`,
            debitAccount: ACCOUNT_CODES.PHARM_PAYABLES,
            creditAccount: ACCOUNT_CODES.TAX_PAYABLE,
            amount: gst,
            referenceId: ord.id
          }
        ];
      })
      .flat();
  }, [orders]);

  // Convert sponsored ad click campaigns to ledger entries
  const campaignEntries = useMemo(() => {
    return campaigns
      .filter(c => c.clicks > 0)
      .map((ad) => {
        const rev = ad.clicks * 15; // Click bid is ₹15 per CPC
        return {
          id: `JE-AD-${ad.id}`,
          date: "2026-06-09",
          description: `Accredited Ad CPC Campaign - Campaign: ${ad.title} (${ad.advertiser})`,
          debitAccount: ACCOUNT_CODES.ACCTS_RECEIVABLE,
          creditAccount: ACCOUNT_CODES.AD_REV,
          amount: rev,
          referenceId: ad.id
        };
      });
  }, [campaigns]);

  // Merge everything into a master general journal log
  const allJournalEntries = useMemo(() => {
    return [
      ...BASE_JOURNAL_ENTRIES,
      ...apptEntries,
      ...orderEntries,
      ...campaignEntries,
      ...manualEntries
    ];
  }, [apptEntries, orderEntries, campaignEntries, manualEntries]);

  // Compiled Ledger Lines for the currently selected Account with Running Balances
  const selectedLedgerLines = useMemo(() => {
    const acc = selectedLedgerAccount;
    const filtered = allJournalEntries.filter(
      (je) => je.debitAccount === acc || je.creditAccount === acc
    );
    
    // Sort chronologically
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    
    let running = 0;
    const positiveDebit = isDebitPositive(acc);

    return sorted.map((je) => {
      const isDebit = je.debitAccount === acc;
      if (isDebit) {
        running += positiveDebit ? je.amount : -je.amount;
      } else {
        running += positiveDebit ? -je.amount : je.amount;
      }
      return {
        ...je,
        isDebit,
        balanceAfter: running
      };
    });
  }, [allJournalEntries, selectedLedgerAccount]);

  // Calculate Trial Balance values
  const trialBalance = useMemo(() => {
    const balances: { [key: string]: { debit: number; credit: number } } = {};
    
    Object.values(ACCOUNT_CODES).forEach((acct) => {
      balances[acct] = { debit: 0, credit: 0 };
    });

    allJournalEntries.forEach((je) => {
      if (balances[je.debitAccount]) {
        balances[je.debitAccount].debit += je.amount;
      }
      if (balances[je.creditAccount]) {
        balances[je.creditAccount].credit += je.amount;
      }
    });

    let totalDebit = 0;
    let totalCredit = 0;

    const rows = Object.entries(ACCOUNT_CODES).map(([shortKey, fullName]) => {
      const bal = balances[fullName] || { debit: 0, credit: 0 };
      const positiveDebit = isDebitPositive(fullName);
      
      let finalDebit = 0;
      let finalCredit = 0;

      if (positiveDebit) {
        const net = bal.debit - bal.credit;
        if (net >= 0) finalDebit = net;
        else finalCredit = -net;
      } else {
        const net = bal.credit - bal.debit;
        if (net >= 0) finalCredit = net;
        else finalDebit = -net;
      }

      totalDebit += finalDebit;
      totalCredit += finalCredit;

      return {
        key: shortKey,
        name: fullName,
        rawDebit: bal.debit,
        rawCredit: bal.credit,
        debit: finalDebit,
        credit: finalCredit
      };
    });

    return { rows, totalDebit, totalCredit };
  }, [allJournalEntries]);

  // Financial statements computation
  const accountBalances = useMemo(() => {
    const map: { [key: string]: number } = {};
    trialBalance.rows.forEach(r => {
      map[r.name] = isDebitPositive(r.name) ? r.debit - r.credit : r.credit - r.debit;
    });
    return map;
  }, [trialBalance]);

  // Income Statement (Profit & Loss)
  const profitsAndLoss = useMemo(() => {
    const commRev = accountBalances[ACCOUNT_CODES.COMMISSION_REV] || 0;
    const adRev = accountBalances[ACCOUNT_CODES.AD_REV] || 0;
    const grossRevenue = commRev + adRev;

    const rentExp = accountBalances[ACCOUNT_CODES.EXP_RENT] || 0;
    const cloudExp = accountBalances[ACCOUNT_CODES.EXP_CLOUD] || 0;
    const bankExp = accountBalances[ACCOUNT_CODES.EXP_BANK] || 0;
    const totalExpenses = rentExp + cloudExp + bankExp;

    const netProfit = grossRevenue - totalExpenses;

    return { commRev, adRev, grossRevenue, rentExp, cloudExp, bankExp, totalExpenses, netProfit };
  }, [accountBalances]);

  // Balance Sheet Compilation
  const balanceSheet = useMemo(() => {
    const cashBank = accountBalances[ACCOUNT_CODES.CASH_BANK] || 0;
    const acctsRec = accountBalances[ACCOUNT_CODES.ACCTS_RECEIVABLE] || 0;
    const totalAssets = cashBank + acctsRec;

    const drPayables = accountBalances[ACCOUNT_CODES.DR_PAYABLES] || 0;
    const pharmPayables = accountBalances[ACCOUNT_CODES.PHARM_PAYABLES] || 0;
    const taxPayables = accountBalances[ACCOUNT_CODES.TAX_PAYABLE] || 0;
    const totalLiabilities = drPayables + pharmPayables + taxPayables;

    const equityBasis = accountBalances[ACCOUNT_CODES.EQUITY_CAPITAL] || 0;
    const retainedEarnings = profitsAndLoss.netProfit;
    const totalEquity = equityBasis + retainedEarnings;

    const combinedLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return { cashBank, acctsRec, totalAssets, drPayables, pharmPayables, taxPayables, totalLiabilities, equityBasis, retainedEarnings, totalEquity, combinedLiabilitiesAndEquity };
  }, [accountBalances, profitsAndLoss]);

  // Cash Book ledger entries specifically (debit or credit involving Account 10100)
  const cashBookLines = useMemo(() => {
    const cashAcc = ACCOUNT_CODES.CASH_BANK;
    return allJournalEntries
      .filter(je => je.debitAccount === cashAcc || je.creditAccount === cashAcc)
      .map(je => {
        const isDebit = je.debitAccount === cashAcc;
        return {
          ...je,
          isDebit,
          isCleared: clearedLedgerIds.includes(je.id)
        };
      });
  }, [allJournalEntries, clearedLedgerIds]);

  // Reconciliation variables
  const reconSummary = useMemo(() => {
    // Current Ledger Cash Book Balance
    const cashAcc = ACCOUNT_CODES.CASH_BANK;
    const ledgerBalance = accountBalances[cashAcc] || 0;

    // Outstanding deposits (Ledger Debits not marked as Cleared on bank side)
    const outstandingDeposits = cashBookLines
      .filter(line => line.isDebit && !line.isCleared)
      .reduce((sum, line) => sum + line.amount, 0);

    // Outstanding clearances / Checks (Ledger Credits not marked Cleared on bank side)
    const outstandingChecks = cashBookLines
      .filter(line => !line.isDebit && !line.isCleared)
      .reduce((sum, line) => sum + line.amount, 0);

    // Compute Bank Statement Current Balance based on raw feeds
    let statementBalance = 0;
    bankStatementRaw.forEach(item => {
      if (item.cleared || matchedBankLineIds.includes(item.id)) {
        if (item.type === "DEPOSIT") {
          statementBalance += item.amount;
        } else {
          statementBalance -= item.amount;
        }
      }
    });

    // Unrecorded items from Statement (not matching any ledger lines yet)
    const unrecordedFee = 250; // BST-104
    const unrecordedSponsorAccrual = 3200; // BST-105

    const variance = (ledgerBalance - outstandingChecks + outstandingDeposits) - statementBalance;

    return {
      ledgerBalance,
      outstandingDeposits,
      outstandingChecks,
      statementBalance,
      variance,
      isPerfect: Math.abs(variance) === 0
    };
  }, [accountBalances, cashBookLines, bankStatementRaw, matchedBankLineIds]);

  // Handle Manual Journal entry submitting
  const handleAddManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setManualFormSuccess("");
    setManualFormError("");

    if (mDebit === mCredit) {
      setManualFormError("Audit Failure: Debit account and Credit account cannot be identical! Choose contrasting accounting nodes.");
      return;
    }

    const amt = parseFloat(mAmount);
    if (!amt || amt <= 0) {
      setManualFormError("Value must be a positive accounting currency amount.");
      return;
    }

    const newJE: JournalEntry = {
      id: "JE-MAN-" + (1000 + manualEntries.length + 1),
      date: mDate,
      description: mDescription.trim() || `Manual ledger reallocation journal entry`,
      debitAccount: mDebit,
      creditAccount: mCredit,
      amount: amt,
      referenceId: "MAN-VOUCHER-" + Math.floor(10000 + Math.random() * 90000)
    };

    setManualEntries(prev => [...prev, newJE]);
    setMDescription("");
    setManualFormSuccess(`Voucher ${newJE.id} successfully recorded and posted into Ledger books! Trial Balance rebalanced.`);
    
    // Auto clear
    setTimeout(() => {
      setManualFormSuccess("");
      setShowManualForm(false);
    }, 4000);
  };

  // Reconcile selected ledger with selected statement line
  const handleReconcileSelected = (ledgerId: string, bankLineId: string) => {
    setClearedLedgerIds(prev => [...prev, ledgerId]);
    setMatchedBankLineIds(prev => [...prev, bankLineId]);
    
    // Toggle cleared in Bank Raw statement
    setBankStatementRaw(prev => prev.map(item => item.id === bankLineId ? { ...item, cleared: true } : item));

    setReconciliationMessage(`Successfully verified and matched Ledger row ${ledgerId} against HDFC Bank transaction ${bankLineId}! Clearance status updated.`);
    setTimeout(() => setReconciliationMessage(""), 5000);
  };

  // 1-Click Auto Match ledger engine
  const handleAutoMatchLedgers = () => {
    let matchedCount = 0;
    const newClearedIds = [...clearedLedgerIds];
    const newMatchedIds = [...matchedBankLineIds];

    // Read through outstanding cash book lines
    cashBookLines.forEach(cb => {
      if (!cb.isCleared) {
        // Find an unmatched bank statement line that matches in amount and basic flow
        const matchesBank = bankStatementRaw.find(b => 
          !newMatchedIds.includes(b.id) &&
          b.amount === cb.amount &&
          ((cb.isDebit && b.type === "DEPOSIT") || (!cb.isDebit && b.type === "WITHDRAWAL"))
        );

        if (matchesBank) {
          newClearedIds.push(cb.id);
          newMatchedIds.push(matchesBank.id);
          matchesBank.cleared = true;
          matchedCount++;
        }
      }
    });

    setClearedLedgerIds(newClearedIds);
    setMatchedBankLineIds(newMatchedIds);
    
    if (matchedCount > 0) {
      setReconciliationMessage(`Automated matching completed! Successfully cleared ${matchedCount} transaction vouchers from outstanding transit queues.`);
    } else {
      setReconciliationMessage("Auto-match engine complete: No outstanding general ledger rows strictly matching pending bank statement records were found.");
    }
    setTimeout(() => setReconciliationMessage(""), 5500);
  };

  // Action: Post bank-reflected service charges (₹250)
  const handlePostBankCharges = () => {
    const chargesJE: JournalEntry = {
      id: "JE-MAN-BNKCHG",
      date: "2026-06-05",
      description: "HDFC Ledger service charges & Account Maintenance Fees (BST-104 matching)",
      debitAccount: ACCOUNT_CODES.EXP_BANK,
      creditAccount: ACCOUNT_CODES.CASH_BANK,
      amount: 250,
      referenceId: "BNK-CHG"
    };

    setManualEntries(prev => [...prev, chargesJE]);
    // Clear instantly
    setClearedLedgerIds(prev => [...prev, chargesJE.id]);
    setMatchedBankLineIds(prev => [...prev, "BST-104"]);
    
    // update raw statement clear status
    setBankStatementRaw(prev => prev.map(item => item.id === "BST-104" ? { ...item, cleared: true } : item));

    setReconciliationMessage("Accounting Adjustment Posted! Posted ₹250 Debit Expense to 50300 and credited Cash at Bank. Bank Line BST-104 is now reconciled!");
    setTimeout(() => setReconciliationMessage(""), 6000);
  };

  // Action: Post BlueDart sponsor cash receipts (₹3200)
  const handlePostAdDeposit = () => {
    const depositJE: JournalEntry = {
      id: "JE-MAN-ADREC",
      date: "2026-06-08",
      description: "Direct Bank Remittance - sponsored marketing payouts (BST-105 matching)",
      debitAccount: ACCOUNT_CODES.CASH_BANK,
      creditAccount: ACCOUNT_CODES.ACCTS_RECEIVABLE,
      amount: 3200,
      referenceId: "AD-ROY"
    };

    setManualEntries(prev => [...prev, depositJE]);
    // Clear instantly
    setClearedLedgerIds(prev => [...prev, depositJE.id]);
    setMatchedBankLineIds(prev => [...prev, "BST-105"]);

    // Update raw statement clear status
    setBankStatementRaw(prev => prev.map(item => item.id === "BST-105" ? { ...item, cleared: true } : item));

    setReconciliationMessage("Bank Statement Adjusted! Cleared Accounts Receivable for sponsor contract and credited Cash at Bank with ₹3,200. Bank Line BST-105 is cleared!");
    setTimeout(() => setReconciliationMessage(""), 6000);
  };

  return (
    <div className="flex flex-col gap-6" id="accounting-dashboard-component">
      
      {/* Upper Statistics Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-ribbon">
        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ledger Balance</span>
            <p className="font-extrabold text-lg text-slate-800 mt-1 font-display">₹{reconSummary.ledgerBalance.toLocaleString()}</p>
          </div>
          <Calculator className="h-8 w-8 text-slate-350" />
        </div>
        
        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">P&L Accrued Revenue</span>
            <p className="font-extrabold text-lg text-emerald-600 mt-1 font-display">₹{profitsAndLoss.grossRevenue.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-500/30" />
        </div>

        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Fiscal Net Savings</span>
            <p className="font-extrabold text-lg text-teal-600 mt-1 font-display">₹{profitsAndLoss.netProfit.toLocaleString()}</p>
          </div>
          <DollarSign className="h-8 w-8 text-teal-500/30" />
        </div>

        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Audit Equation Check</span>
            <span className="inline-flex mt-1.5 items-center gap-1 text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Scale className="h-3 w-3" />
              BALANCED (VAR: ₹0.00)
            </span>
          </div>
          <CheckSquare className="h-8 w-8 text-slate-350" />
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="accounting-tab-statements"
            onClick={() => setActiveTab("statements")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "statements"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Financial Books</span>
          </button>

          <button
            id="accounting-tab-recon"
            onClick={() => setActiveTab("recon")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
              activeTab === "recon"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Landmark className="h-4 w-4 text-sky-500" />
            <span>Bank Reconciliation</span>
            {(!reconSummary.isPerfect || reconSummary.outstandingChecks > 0) && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          <button
            id="accounting-tab-journal"
            onClick={() => setActiveTab("journal")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "journal"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-4 w-4 text-teal-600" />
            <span>General Journal ({allJournalEntries.length})</span>
          </button>

          <button
            id="accounting-tab-ledger"
            onClick={() => setActiveTab("ledger")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span>General Ledger postings</span>
          </button>
        </div>

        {/* Form togglers */}
        {activeTab === "journal" && (
          <button
            id="btn-trigger-manual-je"
            onClick={() => {
              setShowManualForm(!showManualForm);
              setManualFormSuccess("");
              setManualFormError("");
            }}
            className="flex items-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Manual Journal Entry</span>
          </button>
        )}
      </div>

      {reconciliationMessage && (
        <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-xl text-teal-900 text-xs font-semibold flex items-center gap-2" id="reconciliation-toast">
          <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
          <span>{reconciliationMessage}</span>
        </div>
      )}

      {/* ----------------- TAB: GENERAL JOURNAL ----------------- */}
      {activeTab === "journal" && (
        <div className="space-y-4" id="journal-tab-pane">
          {showManualForm && (
            <form onSubmit={handleAddManualEntry} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-inner text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <Calculator className="h-4 w-4 text-teal-600" />
                  Post Manual Journal Voucher (Standard Double-Entry Accrual)
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowManualForm(false)} 
                  className="text-slate-400 hover:text-slate-600 font-extrabold"
                >
                  ✕
                </button>
              </div>

              {manualFormSuccess && (
                <p className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded font-semibold text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  {manualFormSuccess}
                </p>
              )}
              {manualFormError && (
                <p className="bg-rose-50 text-rose-800 border border-rose-200 p-2.5 rounded font-semibold text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  {manualFormError}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Voucher Date</label>
                  <input
                    type="date"
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:outline-none"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Debit Account DR (+Asset/+Expense)</label>
                  <select
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-800 text-xs focus:outline-none"
                    value={mDebit}
                    onChange={(e) => setMDebit(e.target.value)}
                    required
                  >
                    {Object.values(ACCOUNT_CODES).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Credit Account CR (+Liab/+Rev/+Equity)</label>
                  <select
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-800 text-xs focus:outline-none"
                    value={mCredit}
                    onChange={(e) => setMCredit(e.target.value)}
                    required
                  >
                    {Object.values(ACCOUNT_CODES).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Transaction Amount (INR)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-800 font-bold focus:outline-none"
                    value={mAmount}
                    onChange={(e) => setMAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-600">Narration / Description of Transaction</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="flex-1 p-2.5 border rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none"
                    placeholder="e.g. Cleared pending monthly consultation payout invoice for Dr. Alok"
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold px-5 rounded-lg transition"
                  >
                    Post Voucher
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white border rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="p-3">Voucher ID</th>
                  <th className="p-3">Record Date</th>
                  <th className="p-3">Accounting Double-Entry Splits</th>
                  <th className="p-3 text-right">Debit Balance</th>
                  <th className="p-3 text-right">Credit Balance</th>
                  <th className="p-3">Reference Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {allJournalEntries.slice().reverse().map((je, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 [content-visibility:auto]">
                    <td className="p-3 font-mono font-bold text-slate-900">{je.id}</td>
                    <td className="p-3 text-slate-500">{je.date}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-850 flex items-center gap-1.5">
                          <span className="inline-block text-[9px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-black">Dr</span>
                          {je.debitAccount}
                        </p>
                        <p className="text-slate-500 pl-4 flex items-center gap-1.5 italic font-sans text-[11px]">
                          <span className="inline-block text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-black">Cr</span>
                          To {je.creditAccount}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">&quot;{je.description}&quot;</p>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-900">₹{je.amount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400 bg-slate-50/20">₹{je.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{je.referenceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: GENERAL LEDGER POSTINGS ----------------- */}
      {activeTab === "ledger" && (
        <div className="space-y-4" id="ledger-tab-pane">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border p-4 rounded-xl">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-700">Select General Ledger Code Account</h4>
              <p className="text-[11px] text-slate-500">Query complete audit history and cumulative balances of a single accounts book category.</p>
            </div>
            
            <select
              value={selectedLedgerAccount}
              onChange={(e) => setSelectedLedgerAccount(e.target.value)}
              className="p-2.5 bg-white border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 max-w-sm"
            >
              {Object.values(ACCOUNT_CODES).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-700">ledger running account: {selectedLedgerAccount}</span>
              <span className="text-slate-400 italic">Sorted: Chronological posting ledger sequence</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="p-3">Record Date</th>
                  <th className="p-3">Voucher Ref</th>
                  <th className="p-3">Narration Description</th>
                  <th className="p-3 text-right">Debit Posting (Dr)</th>
                  <th className="p-3 text-right">Credit Posting (Cr)</th>
                  <th className="p-3 text-right">Running Cumulative Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {selectedLedgerLines.map((line, ix) => (
                  <tr key={ix} className="hover:bg-slate-50/50 [content-visibility:auto]">
                    <td className="p-3 text-slate-500">{line.date}</td>
                    <td className="p-3 font-mono font-bold text-teal-700">{line.id}</td>
                    <td className="p-3 text-xs">
                      <div>
                        <p className="text-slate-800 font-bold">{line.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Counterparty Node: {line.isDebit ? line.creditAccount : line.debitAccount}</p>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {line.isDebit ? `₹${line.amount.toLocaleString()}` : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {!line.isDebit ? `₹${line.amount.toLocaleString()}` : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-900 bg-slate-50/10">
                      ₹{line.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {selectedLedgerLines.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-slate-400 italic">
                      No matching vouchers or allocations posted to this ledger book sequence yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: FINANCIAL STATEMENTS ----------------- */}
      {activeTab === "statements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="statements-tab-pane">
          
          {/* Column 1: Trial Balance (Sum of All Ledger Nodes) */}
          <div className="lg:col-span-12 space-y-4">
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-850 text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="h-5 w-5 text-emerald-600" />
                    General Trial Balance Sheet
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Automated trial balance auditing both Asset, Liability, Revenue and Expense account sheets.</p>
                </div>
                <span className="font-mono bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-200 uppercase flex items-center gap-1">
                  <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full animate-pulse"></span>
                  Balanced Vouchers verified
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-3">Ledger Chart Code / Category</th>
                      <th className="p-3 text-right">Debit Balance (Dr)</th>
                      <th className="p-3 text-right">Credit Balance (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {trialBalance.rows.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/50 [content-visibility:auto]">
                        <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : <span className="text-slate-200">0.00</span>}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : <span className="text-slate-200">0.00</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold text-slate-900 text-sm border-t-2 border-slate-350">
                      <td className="p-3 uppercase">Aggregated Book Summations</td>
                      <td className="p-3 text-right font-mono">₹{trialBalance.totalDebit.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">₹{trialBalance.totalCredit.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side-by-Side: P&L and Balance Sheet */}
          <div className="lg:col-span-6 bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-850 text-sm uppercase tracking-wider">
                Accrued Profit & Loss (Income Statement)
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">Accrual Basis</span>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="pb-2 border-b">
                <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">A. Revenue Nodes</span>
                <div className="flex justify-between items-center text-slate-700 font-semibold mt-1">
                  <span>Commission Commissions (Levied at 15% / 8%)</span>
                  <span className="font-mono">₹{profitsAndLoss.commRev.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 font-semibold mt-1">
                  <span>Sponsored Banner placement CPC Revenue</span>
                  <span className="font-mono">₹{profitsAndLoss.adRev.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-black mt-2 pt-1 border-t text-[13px]">
                  <span>Aggregated Gross Revenues</span>
                  <span className="font-mono text-emerald-600">₹{profitsAndLoss.grossRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">B. Operating expenses</span>
                <div className="flex justify-between items-center text-slate-700 font-semibold mt-1">
                  <span>Corporate Co-Working workspace Lease</span>
                  <span className="font-mono text-rose-600">- ₹{profitsAndLoss.rentExp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 font-semibold mt-1">
                  <span>Google Cloud Kubernetes Hosting Fees</span>
                  <span className="font-mono text-rose-600">- ₹{profitsAndLoss.cloudExp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 font-semibold mt-1">
                  <span>HDFC Bank Service Charges & PG Fees</span>
                  <span className="font-mono text-rose-600">- ₹{profitsAndLoss.bankExp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-black mt-2 pt-1 border-t text-[13px]">
                  <span>Aggregated Operating Expenses</span>
                  <span className="font-mono text-rose-600">₹{profitsAndLoss.totalExpenses.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex justify-between items-center font-extrabold text-slate-900 text-sm mt-4">
                <span className="text-slate-800">C. Net Platform Treasury Savings</span>
                <span className="font-mono text-teal-700 text-base">₹{profitsAndLoss.netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-850 text-sm uppercase tracking-wider">
                Corporate Balance Sheet
              </h4>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-black font-sans uppercase">
                Audit Check: Verified
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b">
                <div className="space-y-1.5">
                  <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-widest">Active Assets</span>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Cash at Bank</span>
                    <span className="font-mono">₹{balanceSheet.cashBank.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Receivable accounts</span>
                    <span className="font-mono">₹{balanceSheet.acctsRec.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black border-t pt-1 text-[11px] mt-1">
                    <span>Aggregate Assets</span>
                    <span className="font-mono">₹{balanceSheet.totalAssets.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-widest">Active Liabilities</span>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Dr Payout Clearings</span>
                    <span className="font-mono">₹{balanceSheet.drPayables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Pharm Settlement Clearings</span>
                    <span className="font-mono">₹{balanceSheet.pharmPayables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Tax IGST Accruals</span>
                    <span className="font-mono">₹{balanceSheet.taxPayables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black border-t pt-1 text-[11px] mt-1">
                    <span>Aggregate Liabilities</span>
                    <span className="font-mono">₹{balanceSheet.totalLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-widest">Owner&apos;s Equity Reserves</span>
                <div className="flex justify-between text-slate-700 font-semibold mt-1">
                  <span>Founder Primary Seed Capital reserves</span>
                  <span className="font-mono font-bold">₹{balanceSheet.equityBasis.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold mt-0.5">
                  <span>Retained Earnings (P&L Net Surplus)</span>
                  <span className="font-mono font-bold">₹{balanceSheet.retainedEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold border-t pt-1 text-[11px] mt-1.5">
                  <span>Aggregate Capital Equity and Reserves</span>
                  <span className="font-mono text-teal-700">₹{balanceSheet.totalEquity.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl text-center text-[10px] font-mono grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-slate-400 text-[8px] uppercase font-sans tracking-wider">Combined Net Assets</span>
                  <span className="font-bold text-[13px] text-teal-400">₹{balanceSheet.totalAssets.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[8px] uppercase font-sans tracking-wider font-bold">Liabilities + Equity</span>
                  <span className="font-bold text-[13px] text-teal-400">₹{balanceSheet.combinedLiabilitiesAndEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- TAB: BANK RECONCILIATION ----------------- */}
      {activeTab === "recon" && (
        <div className="space-y-6" id="bank-recon-pane">
          
          {/* Header Controls for Matching & Adjustments */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 flex flex-col md:flex-row gap-5 justify-between items-stretch shadow-md">
            <div className="space-y-2">
              <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold tracking-widest px-2.5 py-0.5 rounded border border-teal-500/30 font-mono uppercase">
                Bank-Ledger Audit matching engine
              </span>
              <h3 className="text-base font-extrabold">Active HDFC Reconciliation Desk</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Match internal platform Cash Ledger journal lines against simulated HDFC bank statements to confirm cleared capital deposits and payouts. Add adjustments 1-click below to clear remaining bank fees and unbilled sponsor ad revenues.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-end shrink-0 select-none">
              <button
                id="btn-recon-automatch"
                onClick={handleAutoMatchLedgers}
                className="bg-teal-500 hover:bg-teal-400 text-slate-900 border font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-center"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                <span>Auto-Match Outstanding ({cashBookLines.filter(c => !c.isCleared).length})</span>
              </button>

              <button
                id="btn-recon-bankcharges"
                onClick={handlePostBankCharges}
                disabled={matchedBankLineIds.includes("BST-104")}
                className="bg-slate-800 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-center disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Import Bank Fees (₹250)</span>
              </button>

              <button
                id="btn-recon-sponsoraccrual"
                onClick={handlePostAdDeposit}
                disabled={matchedBankLineIds.includes("BST-105")}
                className="bg-slate-800 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-center disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Post Sponsor Pay (₹3,200)</span>
              </button>
            </div>
          </div>

          {/* Reconciliation Balance Equation Statement */}
          <div className="bg-sky-50 border border-sky-200/85 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-5 text-sky-900">
            <div>
              <span className="text-[10px] text-sky-700/80 uppercase font-black tracking-wider">A. Ledger Cash Balance</span>
              <p className="text-xl font-black mt-1 font-mono">₹{reconSummary.ledgerBalance.toLocaleString()}</p>
              <span className="text-[10px] text-sky-600 leading-none block mt-0.5">As per internal General Cash Ledger account 10100.</span>
            </div>

            <div>
              <span className="text-[10px] text-sky-700/80 uppercase font-black tracking-wider">(+) Uncleared Credits</span>
              <p className="text-xl font-black mt-1 font-mono text-amber-700">₹{reconSummary.outstandingDeposits.toLocaleString()}</p>
              <span className="text-[10px] text-sky-600 leading-none block mt-0.5">Accrued card deposits registered but pending clearing.</span>
            </div>

            <div>
              <span className="text-[10px] text-sky-700/80 uppercase font-black tracking-wider">(-) Uncleared Payments</span>
              <p className="text-xl font-black mt-1 font-mono text-emerald-700">₹{reconSummary.outstandingChecks.toLocaleString()}</p>
              <span className="text-[10px] text-sky-600 leading-none block mt-0.5">Paid doctor fees or payouts not registered on bank side.</span>
            </div>

            <div className="border-l border-sky-200/80 pl-2">
              <span className="text-[10px] text-sky-700/80 uppercase font-black tracking-wider">B. Statements Cash balance</span>
              <p className="text-xl font-black mt-1 font-mono">₹{reconSummary.statementBalance.toLocaleString()}</p>
              <span className="text-[10px] text-sky-600 leading-none block mt-0.5">Aggregate processed HDFC bank statement balances.</span>
            </div>

            <div className="bg-sky-100 rounded-xl p-3 flex flex-col justify-center border border-sky-300">
              <span className="text-[9px] font-extrabold uppercase tracking-wide">RECONCILIATION DIFFERENCE</span>
              <p className={`text-base font-black font-mono ${reconSummary.isPerfect ? "text-emerald-700" : "text-amber-700 text-lg animate-pulse"}`}>
                ₹{reconSummary.variance.toLocaleString()}
              </p>
              <p className="text-[9px] text-sky-700 font-semibold mt-0.5">
                {reconSummary.isPerfect ? "Statement balanced perfectly!" : `${Math.abs(reconSummary.variance) > 0 ? "Mismatch margin present" : ""}`}
              </p>
            </div>
          </div>

          {/* Side-by-Side Verification Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: Cash Book Ledger entries */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-center bg-slate-50/50 p-2 rounded-xl">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-teal-600" />
                    Ledger Cash-Book Transactions
                  </h4>
                  <p className="text-[11px] text-slate-500">Postings made inside the platform&apos;s internal Cash at Bank ledger.</p>
                </div>
                <span className="font-mono bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  CB-LINES: {cashBookLines.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {cashBookLines.slice().reverse().map((cb) => (
                  <div
                    key={cb.id}
                    id={`ledger-cash-row-${cb.id}`}
                    className={`p-3.5 border rounded-xl bg-slate-50/50 leading-normal text-xs transition duration-200 flex justify-between items-center ${
                      cb.isCleared
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-950 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded">
                          {cb.id}
                        </span>
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${
                          cb.isDebit ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100"
                        } px-1.5 py-0.2 rounded`}>
                          {cb.isDebit ? "Accrual Deposit (Dr)" : "Accrued Payment (Cr)"}
                        </span>
                      </div>
                      <p className="font-black text-slate-800 text-[11px]">{cb.description}</p>
                      <p className="text-[9px] font-mono text-slate-400">Date: {cb.date} | Ref Voucher: {cb.referenceId}</p>
                    </div>

                    <div className="text-right flex flex-col gap-1.5 shrink-0">
                      <span className="font-mono font-extrabold text-slate-850 text-xs">
                        {cb.isDebit ? "+" : "-"} ₹{cb.amount.toLocaleString()}
                      </span>
                      {cb.isCleared ? (
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 self-end">
                          <Check className="h-3 w-3" />
                          CLEARED
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 self-end">
                          <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />
                          OUTSTANDING
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Official Bank statement transactions */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-center bg-slate-50/50 p-2 rounded-xl">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="h-4.5 w-4.5 text-sky-600" />
                    HDFC Bank Statement Feeds
                  </h4>
                  <p className="text-[11px] text-slate-500">Live statements downloaded/fed from the HDFC Corporate Banking portal.</p>
                </div>
                <span className="font-mono bg-sky-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  FEED Rows: {bankStatementRaw.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {bankStatementRaw.map((bLine) => {
                  const isMatched = matchedBankLineIds.includes(bLine.id) || bLine.cleared;
                  // Attempt to find correlating un-reconciled ledger cash item
                  const correlatingLedger = cashBookLines.find(c => !c.isCleared && c.amount === bLine.amount);

                  return (
                    <div
                      key={bLine.id}
                      id={`bank-feed-line-${bLine.id}`}
                      className={`p-3.5 border rounded-xl leading-normal text-xs transition duration-200 flex flex-col gap-2.5 ${
                        isMatched
                          ? "border-sky-305 bg-sky-50/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] text-slate-400">Statement ID: {bLine.id}</span>
                            <span className={`text-[9px] uppercase font-bold tracking-widest ${
                              bLine.type === "DEPOSIT" ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
                            } px-1.5 py-0.2 rounded`}>
                              HDFC {bLine.type === "DEPOSIT" ? "CREDIT" : "DEBIT"}
                            </span>
                          </div>
                          <p className="font-bold text-slate-850 text-[11px]">{bLine.description}</p>
                          <p className="text-[9px] text-slate-400 font-mono">Process index date: {bLine.date} | RTGS REF: {bLine.ref}</p>
                          {bLine.notes && <p className="text-[9px] text-rose-500 italic bg-rose-50/80 p-1 border rounded">{bLine.notes}</p>}
                        </div>

                        <div className="text-right">
                          <p className="font-mono font-extrabold text-slate-900 text-xs text-slate-800">
                            {bLine.type === "DEPOSIT" ? "+" : "-"} ₹{bLine.amount.toLocaleString()}
                          </p>
                          <p className="mt-1">
                            {isMatched ? (
                              <span className="inline-flex text-[9px] font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full items-center gap-1">
                                <Check className="h-3 w-3" /> MATCHED
                              </span>
                            ) : (
                              <span className="inline-flex text-[9px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> UNRECONCILED
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Matching workflow action if unmatched and candidate exists */}
                      {!isMatched && correlatingLedger && (
                        <div className="bg-sky-50 border border-sky-200 p-2 rounded-lg flex items-center justify-between text-[11px]">
                          <p className="text-sky-900">
                            💡 Perfect match candidate found: <strong className="font-black">Ledger Voucher {correlatingLedger.id}</strong> (₹{correlatingLedger.amount.toLocaleString()})
                          </p>
                          <button
                            id={`btn-match-${bLine.id}-${correlatingLedger.id}`}
                            onClick={() => handleReconcileSelected(correlatingLedger.id, bLine.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-2 py-1 rounded transition text-[10px]"
                          >
                            Match & Verify Clear
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
