import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Info,
  Shield,
  Building2,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCategory, ItemType, SecurityLevel, CustodyLocation } from '../types';
import { CAMPUS_CATEGORIES, CAMPUS_LOCATIONS } from '../data/mockData';
import { api } from '../services/api';

export const ReportItemPage: React.FC = () => {
  const { addItem, user, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL pre-fills (e.g. from QR scan: /report?type=found&location=Central+Library)
  const initialType = (searchParams.get('type') as ItemType) || 'found';
  const initialLocation = searchParams.get('location') || 'Central Library';

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [reportType, setReportType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [location, setLocation] = useState(initialLocation);
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportedTime, setReportedTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [description, setDescription] = useState('');
  const [identifyingQuestion, setIdentifyingQuestion] = useState('');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('standard');
  const [custodyLocation, setCustodyLocation] = useState<CustodyLocation>('Central Library Desk');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = 'Item title is required (e.g., Blue Skybags backpack)';
    if (!description.trim() || description.length < 10) {
      errors.description = 'Please provide at least 10 characters describing the item.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = imagePreview;

      // Direct S3 Upload via Presigned URL
      if (selectedFile && api.getToken()) {
        try {
          const presignRes = await api.getPresignedUpload(selectedFile.name, selectedFile.type || 'image/jpeg', false);
          if (presignRes && presignRes.uploadUrl) {
            const putRes = await fetch(presignRes.uploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': selectedFile.type || 'image/jpeg',
              },
              body: selectedFile,
            });
            if (putRes.ok) {
              finalImageUrl = presignRes.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.warn('S3 direct upload fell back:', uploadErr);
        }
      }

      const finalLocation = customLocation.trim()
        ? `${location} (${customLocation.trim()})`
        : location;
      const created = await addItem({
        title,
        type: reportType,
        category,
        location: finalLocation,
        date,
        reportedTime,
        description,
        imageUrl: finalImageUrl,
        reporterName: user.name || 'Anonymous Student',
        reporterDepartment: user.department || 'Campus Department',
        identifyingQuestion: reportType === 'found' ? identifyingQuestion : undefined,
        securityLevel: reportType === 'found' ? securityLevel : undefined,
        custodyLocation: reportType === 'found' ? custodyLocation : undefined,
      });

      setCreatedRef(created.referenceNumber);
      setCreatedId(created.id);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE SCREEN
  if (createdRef && createdId) {
    return (
      <div className="pb-24 md:pb-16 max-w-xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 text-center card-shadow space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F9D91] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Report Published Successfully
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033] mt-2">
              Thank you, {user.name ? user.name.split(' ')[0] : 'Student'}!
            </h2>
            <p className="text-xs sm:text-sm text-[#70798B] mt-1">
              Your {reportType} item report has been cataloged in the college database.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F7FB] border border-[#E7EAF1] text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#70798B]">Report Reference:</span>
              <span className="font-mono font-bold text-[#243B8A] bg-white px-2.5 py-0.5 rounded-lg border border-[#E7EAF1]">
                {createdRef}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#70798B]">Item Name:</span>
              <span className="font-semibold text-[#172033]">{title}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#70798B]">Assigned Location:</span>
              <span className="font-semibold text-[#172033]">{location}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#70798B]">Matching Engine:</span>
              <span className="text-[#0F9D91] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Active Auto-Scan
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/item/${createdId}`)}
              className="flex-1 py-3 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              View Listing
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] font-semibold text-xs sm:text-sm transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATION GUARD: User must sign in before reporting a lost or found item
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="pb-24 md:pb-16 max-w-lg mx-auto px-4 pt-10">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-9 text-center card-shadow space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-[#243B8A] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#243B8A] bg-[#E8EEFF] px-3 py-1 rounded-full">
              Authentication Required
            </span>
            <h2 className="text-2xl font-bold text-[#172033] mt-3">
              Sign In to Report an Item
            </h2>
            <p className="text-xs sm:text-sm text-[#70798B] mt-1.5 leading-relaxed">
              To preserve campus custody safety and deliver instant email match notifications, you must be signed in with your college account before submitting a lost or found item report.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F7FB] border border-[#E7EAF1] text-left space-y-2.5 text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#243B8A] flex-shrink-0" />
              <span>Verified student custody ownership & fraud protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F9D91] flex-shrink-0" />
              <span>Instant email alerts sent to you when an item match is found</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Option to &quot;Remember me&quot; so you stay signed in seamlessly</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: '/report' } } })}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#243B8A] to-[#3B66DE] hover:from-[#1D3070] hover:to-[#2F54BA] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#243B8A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Return to Campus Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 md:pb-16 max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
      {/* Top Breadcrumb & Step Indicators */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (currentStep > 1 ? setCurrentStep((s) => ((s - 1) as any)) : navigate(-1))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70798B] hover:text-[#172033]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === currentStep
                  ? 'w-6 bg-[#243B8A]'
                  : s < currentStep
                  ? 'w-3 bg-[#0F9D91]'
                  : 'w-3 bg-[#E7EAF1]'
              }`}
            />
          ))}
        </div>

        <span className="text-xs text-[#70798B] font-medium">Step {currentStep} of 4</span>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 sm:p-7 card-shadow space-y-6">
        {/* Toggle Lost vs Found Segmented Choice */}
        <div>
          <label className="block text-xs font-bold text-[#70798B] uppercase tracking-wider mb-2">
            Select Report Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F7FB] rounded-2xl border border-[#E7EAF1]">
            <button
              type="button"
              onClick={() => setReportType('lost')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                reportType === 'lost'
                  ? 'bg-rose-50 text-[#D64545] border border-rose-200 shadow-xs'
                  : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>I Lost Something</span>
            </button>

            <button
              type="button"
              onClick={() => setReportType('found')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                reportType === 'found'
                  ? 'bg-[#E8EEFF] text-[#243B8A] border border-[#3559C7]/30 shadow-xs'
                  : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#3559C7]" />
              <span>I Found Something</span>
            </button>
          </div>
        </div>

        {/* STEP 1: ITEM DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                {reportType === 'lost' ? 'What did you misplace?' : 'What did you find?'}
              </h2>
              <p className="text-xs text-[#70798B]">Give a recognizable title and choose the category.</p>
            </div>

            {/* Title field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">Item Name & Brand *</label>
              <input
                type="text"
                placeholder="e.g. boAt Wireless Earphones, Dell Laptop Charger"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-[#172033] focus:outline-none focus:ring-2 ${
                  formErrors.title ? 'border-[#D64545] focus:ring-rose-200' : 'border-[#E7EAF1] focus:ring-[#3559C7]/20'
                }`}
              />
              {formErrors.title && (
                <p className="text-[11px] text-[#D64545] font-medium">{formErrors.title}</p>
              )}
            </div>

            {/* Category Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">Category *</label>
              <div className="flex flex-wrap gap-1.5">
                {CAMPUS_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name as ItemCategory)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      category === cat.name
                        ? 'bg-[#243B8A] text-white shadow-xs font-bold'
                        : 'bg-[#F6F7FB] text-[#70798B] hover:text-[#172033] border border-[#E7EAF1]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Campus Location */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#172033]">
                {reportType === 'found' ? 'Where Did You Find It? (Campus Area & Exact Spot) *' : 'Where Was It Lost? *'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E7EAF1] text-xs sm:text-sm text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#3559C7]/20"
              >
                {CAMPUS_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              {/* Specific Sublocation / Spot Finder */}
              <input
                type="text"
                placeholder={
                  reportType === 'found'
                    ? "Specific Spot (e.g., Table 4 in Reading Hall, 3rd row Bench, near Water Cooler)..."
                    : "Specific Spot (e.g., 2nd floor lab, locker room, lawn bench)..."
                }
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7EAF1] text-xs sm:text-sm text-[#172033] bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3559C7]/20"
              />
              <p className="text-[11px] text-[#70798B]">
                {reportType === 'found' 
                  ? 'Adding the exact desk, floor, or corner helps the owner identify their item quickly.'
                  : 'Mentioning the exact classroom, lab bench, or area helps staff locate it.'}
              </p>
            </div>

            {/* Date and Time Lost or Found */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Date Lost or Found *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Approximate Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM, Afternoon, After Lecture"
                  value={reportedTime}
                  onChange={(e) => setReportedTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                Description & Distinguishing Features *
              </label>
              <textarea
                rows={3}
                placeholder="Mention color, brand tags, stickers, contents inside, or specific scratches..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 ${
                  formErrors.description ? 'border-[#D64545] focus:ring-rose-200' : 'border-[#E7EAF1] focus:ring-[#3559C7]/20'
                }`}
              />
              {formErrors.description && (
                <p className="text-[11px] text-[#D64545] font-medium">{formErrors.description}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PHOTO ATTACHMENT */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Photograph of Item</h2>
              <p className="text-xs text-slate-500">
                Capture live with your mobile camera or upload from your gallery.
              </p>
            </div>

            {/* Image Preview / Capture Box */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-blue-400/40 bg-slate-50 p-4 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="max-h-64 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Captured item"
                      className="max-h-60 object-contain mx-auto rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2.5">
                    {/* Live Camera Button */}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold hover:bg-blue-100 shadow-xs">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Retake Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {/* Gallery Button */}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 sm:py-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto shadow-inner">
                    <Camera className="w-8 h-8 text-blue-600 stroke-[1.8]" />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add Item Photo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Use your camera right now or pick from your device</p>
                  </div>

                  {/* Dual Action Buttons: Live Camera vs Photo Library */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto pt-1">
                    <label className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm active:scale-95 transition-transform">
                      <Camera className="w-4 h-4" />
                      <span>Take Photo (Camera)</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <label className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs active:scale-95 transition-transform">
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>Choose from Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400">Supports JPG, PNG, HEIC up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PRIVACY & OWNER VERIFICATION QUESTION */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Security & Verification</h2>
              <p className="text-xs text-[#70798B]">
                CampusFind protects student privacy by keeping personal contacts hidden.
              </p>
            </div>

            {reportType === 'found' ? (
              <div className="space-y-4">
                {/* Institutional Security & Value Classification */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Item Value & SOP Retention Classification</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Determines physical lockup protocol and holding duration per campus regulations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSecurityLevel('standard')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        securityLevel === 'standard'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">Standard Item</div>
                      <div className="text-[10px] text-slate-500">Books, keys, apparel (30d)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecurityLevel('valuable_secure')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        securityLevel === 'valuable_secure'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-indigo-700">🔒 High-Value Safe</div>
                      <div className="text-[10px] text-slate-500">Phones, laptops, cash (90d)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecurityLevel('perishable')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        securityLevel === 'perishable'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-amber-700">⚠️ Perishable</div>
                      <div className="text-[10px] text-slate-500">Food/drinks (48h hygiene)</div>
                    </button>
                  </div>
                </div>

                {/* Physical Custody Desk */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Physical Custody Drop-Off Desk</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Where the physical item has been deposited or handed over for storage.
                  </p>
                  <select
                    value={custodyLocation}
                    onChange={(e) => setCustodyLocation(e.target.value as CustodyLocation)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Central Library Desk">Central Library Desk (Ground Floor)</option>
                    <option value="Campus Security HQ (Central Safe)">Campus Security HQ (Central Safe)</option>
                    <option value="Student Center Information Counter">Student Center Information Counter</option>
                    <option value="Hostel Warden Office">Hostel Warden Office</option>
                    <option value="Sports Complex Reception">Sports Complex Reception</option>
                    <option value="Departmental Front Desk">Departmental Front Desk</option>
                  </select>
                </div>

                <div className="space-y-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60">
                  <label className="block text-xs font-bold text-blue-900">
                    Ownership Challenge Question (Fraud Prevention)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Ask something only the true owner can describe (e.g. "What sticker is on the laptop lid?" or "Describe lockscreen wallpaper").
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Color of phone case or initials on keychain"
                    value={identifyingQuestion}
                    onChange={(e) => setIdentifyingQuestion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            ) : null}

            {/* Student Reporter details (Auto-filled from auth profile) */}
            <div className="p-4 rounded-2xl bg-[#F6F7FB] border border-[#E7EAF1] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0F9D91]" />
                  <span>Authenticated Reporter Profile</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Student
                </span>
              </div>
              <div className="text-xs space-y-1 text-[#70798B]">
                <p>Name: <strong className="text-[#172033]">{user.name}</strong></p>
                <p>Roll / Student ID: <strong className="text-[#172033]">{user.studentId}</strong></p>
                <p>Official College Email: <strong className="text-[#172033]">{user.email}</strong></p>
              </div>
              <p className="text-[11px] text-[#70798B] italic pt-1 border-t border-[#E7EAF1]">
                🔒 Your email and student ID will never be publicly displayed on item cards. Only verified administrators will coordinate claims.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Review Before Submission</h2>
              <p className="text-xs text-[#70798B]">Please verify the details below before publishing.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F7FB] border border-[#E7EAF1] flex gap-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E7EAF1]"
              />
              <div className="text-xs space-y-1 flex-1 min-w-0">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    reportType === 'lost' ? 'bg-rose-50 text-[#D64545]' : 'bg-[#E8EEFF] text-[#243B8A]'
                  }`}
                >
                  {reportType.toUpperCase()} ITEM
                </span>
                <h4 className="font-bold text-sm text-[#172033] truncate">{title}</h4>
                <p className="text-[#70798B] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#3559C7]" />
                  <span>{location}</span>
                </p>
                <p className="text-[#70798B] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{date}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                By publishing, your submission will immediately become searchable by college students and enrolled staff.
              </span>
            </div>
          </div>
        )}

        {/* Bottom Form Actions */}
        <div className="pt-4 border-t border-[#E7EAF1] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => ((s - 1) as any))}
              className="px-4 py-2.5 rounded-xl border border-[#E7EAF1] text-xs font-semibold text-[#70798B] hover:text-[#172033]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white text-xs sm:text-sm font-semibold shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F9D91] hover:bg-[#0c7c72] text-white text-xs sm:text-sm font-semibold shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
