import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Link2, FileText, AlertTriangle, CheckCircle, XCircle, DollarSign, MapPin, Building, Clock } from "lucide-react";
import { toast } from "sonner";

const ScamJobDetector = () => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [jobPostDate, setJobPostDate] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleScan = async () => {
    if (!name.trim()) {
      toast.error("Please enter the company name");
      return;
    }
    setIsScanning(true);
    toast.info("Analyzing job posting...");
    try {
      const socialMediaObj: any = {};
      if (linkedin) socialMediaObj.linkedin = linkedin;
      if (facebook) socialMediaObj.facebook = facebook;
      if (twitter) socialMediaObj.twitter = twitter;
      if (instagram) socialMediaObj.instagram = instagram;

      const payload: any = { name };
      if (website) payload.website = website;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (address) payload.address = address;
      if (jobDescription) payload.job_description = jobDescription;
      if (salaryOffered) payload.salary_offered = salaryOffered;
      if (requirements) payload.requirements = requirements;
      if (contactPerson) payload.contact_person = contactPerson;
      if (companySize) payload.company_size = companySize;
      if (industry) payload.industry = industry;
      if (Object.keys(socialMediaObj).length > 0) payload.social_media = socialMediaObj;
      if (jobPostDate) payload.job_post_date = jobPostDate;

      const response = await fetch("http://localhost:8000/job/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to analyze job posting");
      const data = await response.json();
      setResults(data.result);
      toast.success("Job analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze job posting");
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'LOW':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              🧑‍💼 Scam Job Detector
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Identify fraudulent job postings and employment scams
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Job Posting to Analyze</CardTitle>
            <CardDescription>
              Enter job and company details for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Company Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corp" required />
              <Label>Website</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com" />
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="hr@company.com" />
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555-1234" />
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City" />
              <Label>Job Description</Label>
              <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Describe the job role..." />
              <Label>Salary Offered</Label>
              <Input value={salaryOffered} onChange={e => setSalaryOffered(e.target.value)} placeholder="$50,000/year" />
              <Label>Requirements</Label>
              <Textarea value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="List job requirements..." />
              <Label>Contact Person</Label>
              <Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Jane Doe" />
              <Label>Company Size</Label>
              <Input value={companySize} onChange={e => setCompanySize(e.target.value)} placeholder="50-200" />
              <Label>Industry</Label>
              <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Technology" />
              <Label>Social Media</Label>
              <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
              <Input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" />
              <Input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="Twitter URL" />
              <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" />
              <Label>Job Post Date</Label>
              <Input value={jobPostDate} onChange={e => setJobPostDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isScanning ? (
                <>
                  <Search className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Job Posting...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Job Legitimacy
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        {isScanning && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Analyzing Job Posting...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Checking salary, company details, and requirement authenticity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 mt-8">
            <CardContent className="py-8 text-center space-y-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Job Analysis Result</h2>
              {results.is_suspicious !== undefined && (
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Suspicious: {results.is_suspicious ? 'Yes' : 'No'}
                </div>
              )}
              {results.risk_level && (
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">Risk Level: {results.risk_level}</div>
              )}
              {results.confidence_score !== undefined && (
                <div className="text-base text-slate-700 dark:text-slate-200">Confidence Score: {results.confidence_score}</div>
              )}
              {results.final_prediction_reason && (
                <div className="text-base text-slate-700 dark:text-slate-200">Reason: {results.final_prediction_reason}</div>
            )}
              {results.timestamp && (
                <div className="text-sm text-slate-500 dark:text-slate-400">Checked at: {results.timestamp}</div>
              )}
              {results.red_flags && results.red_flags.length > 0 && (
                <div className="text-base text-red-600">Red Flags: {results.red_flags.join(', ')}</div>
              )}
                </CardContent>
              </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScamJobDetector;
