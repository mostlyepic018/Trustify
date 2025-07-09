import React, { useState } from "react";
import { AlertTriangle, Search, CheckCircle, XCircle, Globe, Shield, Clock, FileLock, Link as LinkIcon, BadgeCheck, Fingerprint, Server } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

// Helper component for individual result cards
const ResultCard = ({ icon, title, children, isSuspicious }) => (
    <div className={`p-4 rounded-lg shadow-sm border ${isSuspicious ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'}`}>
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 ml-2">{title}</h3>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            {children}
        </div>
    </div>
);

const FakeEcommerceDetector = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL to analyze");
      return;
    }
    setError('');
    setIsScanning(true);
    setResults(null);

    try {
      // Real backend call
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (!response.ok) throw new Error("Failed to analyze website");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictStyles = (verdict = '') => {
    switch (verdict) {
      case 'Safe':
        return {
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
          borderColor: 'border-emerald-200 dark:border-emerald-700',
          icon: <CheckCircle className="w-6 h-6" />
        };
      case 'Suspicious':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          borderColor: 'border-amber-200 dark:border-amber-700',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      case 'Fake':
      case 'Unsafe':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700',
          icon: <XCircle className="w-6 h-6" />
        };
      default:
        return { color: '', bgColor: '', borderColor: '', icon: null };
    }
  };

  const verdictStyles = getVerdictStyles(results?.verdict);

  return (
    <DashboardLayout>
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                          Fake E-commerce Detector
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                          Verify online store authenticity and detect fraudulent websites
                      </p>
                  </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-6">
                  <div className="space-y-2">
                      <label htmlFor="url-input" className="text-slate-700 dark:text-slate-300 font-medium">
                          Website URL
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                          <input
                              id="url-input"
                              placeholder="https://suspicious-deals-store.com"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <button
                              onClick={handleScan}
                              disabled={isScanning}
                              className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isScanning ? (
                                  <><Search className="w-5 h-5 mr-2 animate-spin" />Analyzing...</>
                              ) : (
                                  <><Search className="w-5 h-5 mr-2" />Check Safety</>
                              )}
                          </button>
                      </div>
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </div>
              </div>

              {isScanning && (
                  <div className="text-center p-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-md">
                      <Globe className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">Scanning Website...</h3>
                      <p className="text-slate-600 dark:text-slate-400">Checking domain, SSL, and other security indicators.</p>
                  </div>
              )}

              {results && (
                  <div className="space-y-6">
                      <div className={`p-6 rounded-xl border-2 ${verdictStyles.bgColor} ${verdictStyles.borderColor}`}>
                          <div className="text-center space-y-4">
                              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-lg font-semibold ${verdictStyles.color} ${verdictStyles.bgColor}`}>
                                  {verdictStyles.icon}<span>{results.verdict}</span>
                              </div>
                              <div className="text-slate-600 dark:text-slate-400">
                                  This website has a risk score of
                                  <span className={`font-bold text-4xl block ${verdictStyles.color}`}>{results.risk_score}%</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-6">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Security Assessment Details</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <ResultCard icon={<Clock className="text-blue-500" />} title="Domain" isSuspicious={results.domain.is_suspicious}>
                                  <p>Age: <span className="font-bold">{results.domain.age_days} days</span></p>
                                  {results.domain.is_suspicious ? <p className="font-semibold">Recently registered domain is a warning sign.</p> : <p>Domain has existed for a while.</p>}
                              </ResultCard>
                              <ResultCard icon={<FileLock className="text-green-500" />} title="SSL" isSuspicious={!results.ssl.is_valid}>
                                  <p>Certificate: {results.ssl.is_valid ? <span className="font-bold">Valid</span> : <span className="font-bold">Invalid/Missing</span>}</p>
                                  {results.ssl.is_valid && Array.isArray(results.ssl.issuer) && results.ssl.issuer.length > 0
                                      ? <p>Issuer: {results.ssl.issuer[0][0][1]}</p>
                                      : <p className="font-semibold">Lack of a valid SSL certificate is a major red flag.</p>}
                              </ResultCard>
                              <ResultCard icon={<Fingerprint className="text-cyan-500" />} title="WHOIS" isSuspicious={results.whois.suspicious}>
                                  <p>Registrar: <span className="font-bold">{results.whois.registrar}</span></p>
                                  {results.whois.suspicious && <p className="font-semibold">Registrar information may indicate privacy protection.</p>}
                              </ResultCard>
                              <ResultCard icon={<BadgeCheck className="text-red-500" />} title="Content Patterns" isSuspicious={results.patterns.is_suspicious}>
                                  <p>Suspicious Keywords: {results.patterns.issues && results.patterns.issues.length > 0 ? <span className="font-bold">Detected</span> : <span className="font-bold">None</span>}</p>
                                  {results.patterns.is_suspicious && <p className="font-semibold">Site may use pressure tactics or unrealistic discounts.</p>}
                              </ResultCard>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </DashboardLayout>
  );
};

export default FakeEcommerceDetector;
