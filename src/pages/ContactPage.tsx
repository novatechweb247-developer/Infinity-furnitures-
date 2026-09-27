import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PopOut } from '../components/PopOut';
import { Card3D, Card3DLayer } from '../components/Card3D';
import { SocialLinksGroup } from '../components/SocialIcons';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  general?: string;
}

export function ContactPage() {
  const { activeContent, submitEnquiry } = useCMS();
  const contact = activeContent.contact || {};
  const brand = activeContent.brand || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      newErrors.name = 'Please provide your full name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. client@domain.com).';
    }

    if (!trimmedMessage) {
      newErrors.message = 'Please provide details about your project or bespoke inquiry.';
    } else if (trimmedMessage.length < 5) {
      newErrors.message = 'Please provide at least 5 characters regarding your requirements.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await submitEnquiry({
        name: formData.name.trim(),
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        channel: 'Website Form',
      });

      if (success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setErrors({ general: 'We could not submit your request at this moment. Please reach out via WhatsApp or phone.' });
      }
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrors({ general: 'Encountered an unexpected error. Please contact our showroom directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/${contact.whatsapp || '2348068795174'}?text=${encodeURIComponent(
    'Hello Infinity Furnitures and Interior World Nigeria Limited, I would like to enquire about your bespoke handcrafted furniture and interior architectural services.'
  )}`;

  return (
    <div className="pt-24 pb-20 bg-[#121212] text-[#e5e2db] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <PopOut direction="pop-up">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059] font-medium block mb-3">
              Official Inquiry Center
            </span>
          </PopOut>
          <PopOut direction="pop-up" delay={0.08}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#e5e2db] tracking-tight mb-4">
              Connect with Our Atelier
            </h1>
          </PopOut>
          <PopOut direction="pop-up" delay={0.16}>
            <p className="text-sm sm:text-base text-[#b0aca3] font-light leading-relaxed">
              Every commission begins with a conversation. Share your architectural floor plans, bespoke furniture aspirations, or schedule a personal private showroom consultation.
            </p>
          </PopOut>
        </div>

        {/* 2-Column Split: Direct Showroom Info & Exclusive Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Atelier Coordinates & Direct Actions */}
          <div className="lg:col-span-5 space-y-8">
            <PopOut direction="pop-left" delay={0.1}>
              <Card3D depth={6} glare={true} className="rounded-3xl border border-white/10 bg-[#181818]/90 backdrop-blur-md p-8 shadow-2xl">
                <Card3DLayer depth={20}>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl font-serif text-[#c5a059]">∞</span>
                    <span className="text-xs uppercase tracking-[0.25em] text-white font-serif">
                      {brand.businessName || 'INFINITY FURNITURE'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-serif text-[#e5e2db] mb-4">
                    Showroom & Atelier
                  </h2>
                  <p className="text-xs sm:text-sm text-[#b0aca3] font-light leading-relaxed mb-6">
                    Experience our craftsmanship in person. Discover curated hardwoods, hand-finished veneers, and custom upholstery in our flagship studio.
                  </p>

                  <div className="space-y-4 text-xs pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/90">Flagship Studio Location</span>
                        <span className="text-white/60 leading-relaxed">
                          {contact.address || 'Jos, Plateau State'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/90">Direct Concierge Telephone</span>
                        <div className="text-white/60">
                          <a
                            href={`tel:${(contact.phone1 || contact.phone || '0806 879 5174').replace(/[^0-9+]/g, '')}`}
                            className="block hover:text-[#c5a059] transition-colors"
                          >
                            {contact.phone1 || contact.phone || '0806 879 5174'}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/90">Architectural & Sales Correspondence</span>
                        <a href={`mailto:${contact.email || 'Lawalcy68@gmail.com'}`} className="text-white/60 hover:text-[#c5a059] transition-colors">
                          {contact.email || 'Lawalcy68@gmail.com'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/90">Consultation Hours</span>
                        <span className="text-white/60 leading-relaxed">
                          {contact.openingHours || 'Monday – Saturday: 9:00 AM – 6:30 PM (Private viewings upon request)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Quick Trigger */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Instant WhatsApp Consultation</span>
                    </a>
                  </div>

                  {/* Multi-Platform Social Media Channels */}
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-semibold block">
                        Official Social Portfolios
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        Instagram • TikTok • Facebook • X
                      </span>
                    </div>
                    <SocialLinksGroup variant="contact" />
                  </div>
                </Card3DLayer>
              </Card3D>
            </PopOut>

            {/* Quality Commitment Notice */}
            <PopOut direction="pop-up" delay={0.2}>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-[#c5a059] shrink-0 mt-1" />
                <div className="text-xs space-y-1">
                  <h3 className="font-serif text-[#e5e2db] font-medium">Bespoke Privacy & White-Glove Service</h3>
                  <p className="text-[#b0aca3] font-light leading-relaxed">
                    All specifications, architectural blueprints, and client details remain strictly confidential within our workshop.
                  </p>
                </div>
              </div>
            </PopOut>
          </div>

          {/* Right Column: Exclusive Dedicated Inquiry Form */}
          <div className="lg:col-span-7">
            <PopOut direction="pop-out" delay={0.15}>
              <Card3D depth={5} glare={true} className="rounded-3xl border border-white/10 bg-[#181818]/95 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <Card3DLayer depth={15}>
                  <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold block mb-1">
                        Commission Inquiry Form
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif text-[#e5e2db]">
                        Initiate Your Project
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>

                  {submitted ? (
                    <div className="py-12 px-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-serif text-white">Inquiry Received with Distinction</h3>
                      <p className="text-sm text-[#b0aca3] max-w-md mx-auto font-light leading-relaxed">
                        Thank you for reaching out to Infinity Furnitures and Interior World Nigeria Limited. Our principal interior designer and bespoke furniture lead will review your specifications and contact you within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-6 bg-[#c5a059] hover:bg-[#b08e4c] text-[#121212] px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                      {errors.general && (
                        <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                          <span>{errors.general}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-white/80 mb-2">
                            Full Name <span className="text-[#c5a059]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Lord / Lady / Dr. / Full Name"
                            className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                              errors.name
                                ? 'border-red-500 focus:border-red-400 bg-red-900/10'
                                : 'border-white/10 focus:border-[#c5a059] focus:bg-white/[0.06]'
                            }`}
                          />
                          {errors.name && (
                            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors.name}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-white/80 mb-2">
                            Telephone / Mobile
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+234 or international format"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059] focus:bg-white/[0.06] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.15em] font-medium text-white/80 mb-2">
                          Email Address <span className="text-[#c5a059]">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="client@domain.com"
                          className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                            errors.email
                              ? 'border-red-500 focus:border-red-400 bg-red-900/10'
                              : 'border-white/10 focus:border-[#c5a059] focus:bg-white/[0.06]'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.15em] font-medium text-white/80 mb-2">
                          Project Description or Bespoke Requirements <span className="text-[#c5a059]">*</span>
                        </label>
                        <textarea
                          rows={5}
                          value={formData.message}
                          onChange={(e) => {
                            setFormData({ ...formData, message: e.target.value });
                            if (errors.message) setErrors({ ...errors, message: undefined });
                          }}
                          placeholder="Provide details about your project: room types (e.g. Master Living, Executive Suite, Full Villa), preferred timber species, timeline, or specific custom furniture pieces..."
                          className={`w-full bg-white/[0.04] border rounded-xl p-4 text-xs text-white placeholder-white/30 focus:outline-none transition-all resize-none ${
                            errors.message
                              ? 'border-red-500 focus:border-red-400 bg-red-900/10'
                              : 'border-white/10 focus:border-[#c5a059] focus:bg-white/[0.06]'
                          }`}
                        />
                        {errors.message && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.message}</span>
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#c5a059] hover:bg-[#b08e4c] text-[#121212] py-4 px-8 rounded-full text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Transmitting Consultation Details...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Project Inquiry</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </Card3DLayer>
              </Card3D>
            </PopOut>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContactPage;
