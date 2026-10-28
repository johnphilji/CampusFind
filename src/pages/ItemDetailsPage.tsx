import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  Share2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Lock,
  ChevronRight,
  AlertTriangle,
  Building2,
  FileCheck,
  Camera,
  Upload,
  Send,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, TypeBadge, SecurityBadge } from '../components/cards/Badges';
import { ItemCard } from '../components/cards/ItemCard';
import { ResponsiveImage } from '../components/cards/ResponsiveImage';
import { VerificationMethod } from '../types';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, claims, submitClaim, reportSighting, user, isAuthenticated } = useApp();

  const item = items.find(i => i.id === id);

  // Check if current user or another student has already filed a claim or if item is already claimed
  const existingUserClaim = claims.find(c => (c.itemId === id || c.itemId === item?.id) && (c.claimantId === user.id || c.claimantEmail === user.email));
  const hasApprovedClaim = claims.some(c => (c.itemId === id || c.itemId === item?.id) && (c.status === 'Approved' || c.status === 'Item Returned'));
  const isFinder = Boolean(
    user?.id && (
      item?.reporterId === user.id || 
      (item?.reporterEmail && user?.email && item.reporterEmail.toLowerCase() === user.email.toLowerCase())
    )
  );

  // Claim modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimantName, setClaimantName] = useState(user.name);
  const [claimantEmail, setClaimantEmail] = useState(user.email);
  const [claimantId, setClaimantId] = useState(user.studentId);
  const [proofDetails, setProofDetails] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('Unique Markings');
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sighting / Ping modal state for lost items
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingNote, setSightingNote] = useState('');
  const [sightingImage, setSightingImage] = useState('');
  const [isSightingSubmitting, setIsSightingSubmitting] = useState(false);
  const [sightingSuccess, setSightingSuccess] = useState(false);

  if (!item) {
    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#172033]">Item Record Not Found</h2>
        <p className="text-xs text-[#70798B]">The requested item reference may have been removed or already returned.</p>
        <Link
          to="/explore"
          className="inline-flex px-4 py-2 rounded-xl bg-[#243B8A] text-white text-xs font-semibold"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const relatedItems = items
    .filter(i => i.id !== item.id && (i.category === item.category || i.location === item.location))
    .slice(0, 2);

  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDetails.trim()) return;

    setIsClaimSubmitting(true);
    setClaimErrorMessage(null);
    try {
      await submitClaim(item.id, {
        name: claimantName,
        email: claimantEmail,
        studentId: claimantId,
        proof: `${verificationMethod}: ${proofDetails.trim()}`
      });
      setIsClaimSubmitting(false);
      setClaimSuccess(true);
    } catch (err: any) {
      setIsClaimSubmitting(false);
      setClaimErrorMessage(err.message || 'Failed to submit claim. Please check details and try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="pb-28 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
      {/* Top Nav actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70798B] hover:text-[#172033]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E7EAF1] text-xs font-semibold text-[#70798B] hover:text-[#172033] shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="bg-white rounded-3xl border border-[#E7EAF1] overflow-hidden card-shadow">
        {/* Large Photo Section */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-900/5 overflow-hidden">
          <ResponsiveImage
            src={item.imageUrl}
            alt={item.title}
            aspectRatioClass="w-full h-full"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <TypeBadge type={item.type} className="shadow-sm" />
            <StatusBadge status={item.status} className="shadow-sm" />
            {item.securityLevel && (
              <SecurityBadge level={item.securityLevel} className="shadow-sm" />
            )}
          </div>

          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold text-blue-900 shadow-md border border-slate-200 z-10">
            {item.referenceNumber}
          </div>
        </div>

        {/* Item Info Body */}
        <div className="p-5 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-blue-700">{item.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {item.timeAgo}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
              {item.title}
            </h1>
          </div>

          {/* SOP Custody & Verification Banner (If Found Item) */}
          {item.custodyLocation && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    Official Physical Custody Location
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white">{item.custodyLocation}</p>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                Retention Window: <strong className="text-white">{item.daysRetained ?? 0} days active</strong>
              </div>
            </div>
          )}

          {/* Quick Details Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 text-xs text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Campus Zone Found</span>
                <span className="font-semibold">{item.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Reported Date & Time</span>
                <span className="font-semibold">
                  {item.date} {item.reportedTime ? `at ${item.reportedTime}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#70798B]">
              Item Description & Notes
            </h3>
            <p className="text-sm text-[#172033] leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Identifying Challenge Question (if found item) */}
          {item.identifyingQuestion && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Verification Requirement for Claimants:</span>
              </div>
              <p className="text-amber-800">
                "{item.identifyingQuestion}"
              </p>
            </div>
          )}

          {/* Reporter safe badge */}
          <div className="pt-2 border-t border-[#E7EAF1] flex items-center justify-between text-xs text-[#70798B]">
            <div>
              <span>Reported by: </span>
              <strong className="text-[#172033]">{item.reporterName}</strong>
              {item.reporterDepartment && (
                <span className="text-[11px] text-[#70798B]"> ({item.reporterDepartment})</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[#0F9D91] font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Verified ID</span>
            </div>
          </div>

          {/* CTA Claim / Possible Match Action */}
          <div className="pt-4 border-t border-[#E7EAF1]">
            {item.status === 'resolved' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>This item has been safely returned to its rightful owner.</span>
              </div>
            ) : (item.status === 'claimed' || hasApprovedClaim) ? (
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 font-bold text-xs sm:text-sm text-[#1E73E8]">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Ownership Verified & Handover in Progress</span>
                </div>
                <p className="text-xs text-slate-600">
                  This item has already been claimed and approved by the campus verification desk. Further claims cannot be accepted.
                </p>
              </div>
            ) : existingUserClaim ? (
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">Claim Under Review ({existingUserClaim.id})</span>
                    <span className="text-xs text-amber-700">You have already submitted an active ownership claim for this item.</span>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs whitespace-nowrap"
                >
                  Track in Dashboard
                </Link>
              </div>
            ) : isFinder ? (
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">You reported finding this item</span>
                  <span className="text-xs text-slate-500">
                    As the finder, you cannot submit an ownership claim for an item you handed in.
                  </span>
                </div>
              </div>
            ) : item.type === 'found' ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#E8EEFF]/80 to-white p-4 rounded-2xl border border-[#3559C7]/20">
                <div>
                  <h4 className="font-bold text-sm text-[#243B8A]">Is this your misplaced item?</h4>
                  <p className="text-xs text-[#70798B]">
                    Submit an ownership verification claim to coordinate handover at admin desk.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: `/item/${item.id}` } } });
                    } else {
                      setIsClaimModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  {isAuthenticated ? 'Claim This Item' : 'Sign In to Claim Item'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-rose-50/80 to-white p-4 rounded-2xl border border-rose-200">
                <div>
                  <h4 className="font-bold text-sm text-[#D64545]">Spotted or Found this lost item?</h4>
                  <p className="text-xs text-[#70798B]">
                    Ping the owner directly with the exact room or desk where it's located.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: `/item/${item.id}` } } });
                    } else {
                      setIsSightingModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D64545] hover:bg-[#b83838] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>I Spotted / Found It Here</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      {relatedItems.length > 0 && (
        <section className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-[#172033]">
            Other Items in {item.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {relatedItems.map(rel => (
              <ItemCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      )}

      {/* CLAIM MODAL DIALOG */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 card-shadow space-y-4 max-h-[90vh] overflow-y-auto">
            {claimSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#172033]">Claim Filed Successfully!</h3>
                <p className="text-xs text-[#70798B] leading-relaxed">
                  Your verification evidence has been submitted to the campus administrator. You will receive an update in your Activity tab when approved.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsClaimModalOpen(false);
                      setClaimSuccess(false);
                      navigate('/dashboard');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#243B8A] text-white text-xs font-semibold"
                  >
                    Go to My Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7EAF1]">
                  <div>
                    <h3 className="font-bold text-base text-[#172033]">Claim Ownership</h3>
                    <p className="text-[11px] text-[#70798B]">Verification for "{item.title}"</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="text-[#70798B] hover:text-[#172033] text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {claimErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{claimErrorMessage}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#172033] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-[#E7EAF1] text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#172033] mb-1">College Roll / Student ID</label>
                    <input
                      type="text"
                      value={claimantId}
                      onChange={(e) => setClaimantId(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-[#E7EAF1] text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Verification Proof Type *
                    </label>
                    <select
                      value={verificationMethod}
                      onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="Unique Markings">Unique Markings / Stickers / Scratches</option>
                      <option value="Device Passcode / Unlock">Passcode / Device Unlock Verification</option>
                      <option value="Serial / IMEI Number">Serial Number / IMEI / ID Match</option>
                      <option value="Photo ID Match">Photo ID / College ID Match</option>
                      <option value="Purchase Receipt">Purchase Invoice / Bill / Store Receipt</option>
                      <option value="Witness Attestation">Dean / Hostel Warden / Staff Attestation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Proof of Ownership & Specific Identifying Details *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify exact details: wallpaper image, passcode digits to unlock in front of admin, contents inside, or invoice details..."
                      value={proofDetails}
                      onChange={(e) => setProofDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Physical Handover Protocol: You must present your College ID card and demonstrate verification at the designated custody desk ({item.custodyLocation || 'Admin Reception'}).
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaimSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-50 shadow-sm"
                  >
                    {isClaimSubmitting ? 'Verifying...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIGHTING / PING OWNER MODAL */}
      {isSightingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#D64545] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">Ping Owner: Item Spotted / Found</h3>
                  <p className="text-[11px] text-slate-500">The person who lost "{item.title}" will get an instant alert</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSightingModalOpen(false);
                  setSightingSuccess(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sightingSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Owner Notified Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  A personal alert with the exact room and your message has been sent to the student who reported losing this item.
                </p>
                <button
                  onClick={() => {
                    setIsSightingModalOpen(false);
                    setSightingSuccess(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sightingLocation.trim() || !sightingNote.trim()) return;
                  setIsSightingSubmitting(true);
                  try {
                    await reportSighting(item.id, {
                      location: sightingLocation.trim(),
                      note: sightingNote.trim(),
                      imageUrl: sightingImage || undefined
                    });
                    setSightingSuccess(true);
                    setSightingLocation('');
                    setSightingNote('');
                    setSightingImage('');
                  } catch (err) {
                    console.error('Failed to send sighting ping:', err);
                  } finally {
                    setIsSightingSubmitting(false);
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl space-y-1">
                  <span className="font-bold text-[#D64545] block">Lost Item Reference:</span>
                  <p className="text-slate-700">{item.title} ({item.referenceNumber})</p>
                  <p className="text-[11px] text-slate-500">Reported last seen around: {item.location}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Where is it right now? (Specific Room / Desk / Floor) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 402, 3rd row desk near window, OR Deposited at Central Library desk"
                    value={sightingLocation}
                    onChange={(e) => setSightingLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Message / Instructions for the Owner *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. I saw it on the bench 10 mins ago. Handed it over to the floor peon / left it on desk #4."
                    value={sightingNote}
                    onChange={(e) => setSightingNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Optional Sighting Photo */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Photo of Item at Location (Optional)
                  </label>
                  {sightingImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 w-32 h-24">
                      <img src={sightingImage} alt="Sighting preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSightingImage('')}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span>Take Photo or Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSightingImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-[11px] text-slate-400">Attaching a quick photo helps the owner confirm it's theirs.</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSightingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSightingSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#D64545] hover:bg-[#b83838] text-white text-xs font-semibold disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSightingSubmitting ? 'Sending Alert...' : 'Ping Owner'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
