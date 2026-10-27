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
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCategory, ItemType } from '../types';
import { CAMPUS_CATEGORIES, CAMPUS_LOCATIONS } from '../data/mockData';

export const ReportItemPage: React.FC = () => {
  const { addItem, user } = useApp();
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
  const [description, setDescription] = useState('');
  const [identifyingQuestion, setIdentifyingQuestion] = useState('');
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(async () => {
      const finalLocation = location === 'Other Campus Area' && customLocation ? customLocation : location;
      const created = await addItem({
        title,
        type: reportType,
        category,
        location: finalLocation,
        date,
        description,
        imageUrl: imagePreview,
        reporterName: user.name,
        reporterDepartment: user.department,
        identifyingQuestion: reportType === 'found' ? identifyingQuestion : undefined
      });

      setCreatedRef(created.referenceNumber);
      setCreatedId(created.id);
      setIsSubmitting(false);
    }, 700);
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
              Thank you, {user.name.split(' ')[0]}!
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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">Campus Location *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E7EAF1] text-xs sm:text-sm text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#3559C7]/20"
              >
                {CAMPUS_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {location === 'Other Campus Area' && (
                <input
                  type="text"
                  placeholder="Specify exact building, floor, room or lawn..."
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full p-2.5 mt-2 rounded-xl border border-[#E7EAF1] text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#3559C7]/20"
                />
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">Date Lost or Found *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E7EAF1] text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#3559C7]/20"
              />
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
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Photograph of Item</h2>
              <p className="text-xs text-[#70798B]">
                Upload or capture a photo. Photos dramatically increase recovery speed.
              </p>
            </div>

            {/* Image Preview Box */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#3559C7]/40 bg-[#F6F7FB] p-4 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="max-h-64 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="max-h-60 object-contain mx-auto rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E7EAF1] text-xs font-semibold text-[#172033] hover:bg-slate-50 shadow-xs">
                      <Camera className="w-3.5 h-3.5 text-[#3559C7]" />
                      <span>Choose Another</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D64545] hover:bg-rose-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#243B8A]">
                      Take Photo or Select from Gallery
                    </span>
                    <p className="text-xs text-[#70798B] mt-1">PNG, JPG, HEIC up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick Demo Image Selection Pills */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#70798B]">Or select a preset test sample:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImagePreview('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80')}
                  className="px-2.5 py-1 rounded-lg bg-[#F6F7FB] border border-[#E7EAF1] text-[#70798B] hover:text-[#172033]"
                >
                  Smartphone
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreview('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80')}
                  className="px-2.5 py-1 rounded-lg bg-[#F6F7FB] border border-[#E7EAF1] text-[#70798B] hover:text-[#172033]"
                >
                  Earphones
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreview('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80')}
                  className="px-2.5 py-1 rounded-lg bg-[#F6F7FB] border border-[#E7EAF1] text-[#70798B] hover:text-[#172033]"
                >
                  Backpack
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreview('https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80')}
                  className="px-2.5 py-1 rounded-lg bg-[#F6F7FB] border border-[#E7EAF1] text-[#70798B] hover:text-[#172033]"
                >
                  Water Bottle
                </button>
              </div>
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
              <div className="space-y-2 p-4 bg-[#E8EEFF]/40 rounded-2xl border border-[#3559C7]/20">
                <label className="block text-xs font-bold text-[#243B8A]">
                  Ownership Challenge Question (Optional)
                </label>
                <p className="text-[11px] text-[#70798B]">
                  Ask something only the true owner would know, e.g. "What wallpaper is on the lockscreen?" or "What keychain is attached?"
                </p>
                <input
                  type="text"
                  placeholder="e.g. Color of phone case or initials on keychain"
                  value={identifyingQuestion}
                  onChange={(e) => setIdentifyingQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E7EAF1] bg-white text-xs sm:text-sm text-[#172033] focus:outline-none"
                />
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
