"use client";

import { useState } from "react";

const SAMPLE_PAYLOAD = `DOCUMENT 1: MASTER SERVICE AGREEMENT (Contract)
Client: Acme Corp. Service: Premium Support Package. Fee: $12,000 per month, billed on the 1st. Auto-renews annually unless cancelled with 30 days notice.

DOCUMENT 2: INVOICE #1042
Date: Sept 1, 2026. Client: Acme Corp. Description: Standard Support Package. Amount Due: $9,000. Paid: $9,000.

DOCUMENT 3: CLIENT EMAIL (From: john@acmecorp.com, Date: Aug 28, 2026)
Subject: Re: September Support
'Hi team, thanks for the great work in August. Please continue the Premium Support package for September as discussed, we will need the 24/7 coverage for our upcoming launch.'

DOCUMENT 4: INTERNAL SLACK LOG
Agent: 'Acme Corp is on the $9k Standard plan, right?' 
Manager: 'No, they upgraded to Premium ($12k) in July. Make sure it's reflected.'`;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [inputText, setInputText] = useState(SAMPLE_PAYLOAD);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedTask, setGeneratedTask] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Acme Corp - Q3 Reconciliation",
          text: inputText,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to analyze:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftEmail = async () => {
    if (!result) return;
    
    setEmailLoading(true);
    setEmailSuccess(false);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findings: result.findings,
          document: result.document,
          total_loss: result.total_potential_loss,
        }),
      });
      const data = await res.json();
      setGeneratedEmail(data.email);
      setShowEmailModal(true);
      setEmailSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => setEmailSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!result) return;
    
    setTaskLoading(true);
    setTaskSuccess(false);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findings: result.findings,
          document: result.document,
          total_loss: result.total_potential_loss,
        }),
      });
      const data = await res.json();
      setGeneratedTask(data.task);
      setShowTaskModal(true);
      setTaskSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => setTaskSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to generate task:", error);
    } finally {
      setTaskLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "blocked") return "bg-red-100 text-red-800 border-red-200";
    if (status === "conditional") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "critical") return "bg-red-500";
    if (severity === "high") return "bg-orange-500";
    if (severity === "medium") return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AEGIS AI</h1>
            <p className="text-gray-500 mt-1">Autonomous Revenue & Compliance Defense</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-600">System Online</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Document Ingestion (Contracts, Invoices, Communications)
          </label>
          <textarea
            className="w-full h-48 p-4 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Multi-Agent Investigation...
              </>
            ) : (
              "🔍 Initiate Clearance Review"
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Clearance Status Banner */}
            <div className={`rounded-xl border-2 p-6 flex items-center justify-between ${getStatusColor(result.status)}`}>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wide">{result.status} Clearance</h2>
                <p className="text-sm opacity-80 mt-1">Document: {result.document}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium uppercase opacity-80">Total Potential Loss</p>
                <p className="text-4xl font-extrabold">${result.total_potential_loss.toLocaleString()}</p>
              </div>
            </div>

            {/* Findings Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Agent Findings & Evidence Chain</h3>
              {result.findings.map((finding: any, index: number) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${getSeverityColor(finding.severity)}`}></span>
                      <span className="font-semibold text-gray-900 capitalize">{finding.severity} Severity</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600 font-medium">{finding.agent}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-gray-600">Confidence:</span>
                      <span className="text-sm font-bold text-gray-900">{(finding.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4 leading-relaxed">{finding.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Expected</p>
                      <p className="text-sm font-medium text-green-700">{finding.expected}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Actual</p>
                      <p className="text-sm font-medium text-red-700">{finding.actual}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Evidence Chain</p>
                    <p className="text-sm text-gray-600 italic bg-blue-50 p-3 rounded border border-blue-100">
                      "{finding.evidence}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Center */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Remediation</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDraftEmail}
                  disabled={emailLoading || !result}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[50px]"
                >
                  {emailLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : emailSuccess ? (
                    <>
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email Generated!
                    </>
                  ) : (
                    <>
                      ✉️ Draft Billing Adjustment Email
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleCreateTask}
                  disabled={taskLoading || !result}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 disabled:border-gray-100 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[50px]"
                >
                  {taskLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : taskSuccess ? (
                    <>
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Task Created!
                    </>
                  ) : (
                    <>
                      📋 Create Finance Task
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Billing Adjustment Email</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-200 overflow-y-auto max-h-[60vh] flex-grow">
              {generatedEmail}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedEmail);
                  alert("Email copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                📋 Copy to Clipboard
              </button>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Finance Task Created</h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-200 overflow-y-auto max-h-[60vh] flex-grow">
              {generatedTask}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedTask);
                  alert("Task copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                📋 Copy to Clipboard
              </button>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}