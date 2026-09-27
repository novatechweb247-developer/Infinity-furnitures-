import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { SocialLinksGroup } from './SocialIcons';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export function ContactSection() {
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
      newErrors.message = 'Please provide details about your project or enquiry.';
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

  const whatsappLink = `https://wa.me/${contact.whatsapp || '2348068795174'}?text=${encodeURIComponent(
    'Hello Infinity Furnitures and Interior World Nigeria Limited, I would like to enquire about bespoke furniture and interior solutions.'
  )}`;

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#121212] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left info & direct contact buttons with PopOut */}
          <div className="lg:col-span-5 space-y-8">
            <PopOut direction="pop-up">
              <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
                Contact & Showroom
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db] mb-6">
                {brand.businessName || 'Infinity Furnitures and Interior World Nigeria Limited'}
              </h2>
              <p className="text-[#b0aca3] text-sm sm:text-base font-light leading-relaxed">
                Connect with our master artisans and interior designers to discuss your bespoke architectural project, private residence, or commercial fit-out.
              </p>
            </PopOut>

            <PopOut direction="late-pop" delay={0.1}>
              <div className="space-y-4 text-lg font-serif text-[#e5e2db]">
                <a
                  href={`tel:${(contact.phone1 || contact.phone || '0806 879 5174').replace(/[^0-9+]/g, '')}`}
                  className="block hover:text-[#c5a059] transition-colors"
                >
                  {contact.phone1 || contact.phone || '0806 879 5174'}
                </a>
                <a
                  href={`mailto:${contact.email || 'Lawalcy68@gmail.com'}`}
                  className="block text-sm font-sans tracking-wider text-[#b0aca3] hover:text-[#c5a059] transition-colors"
                >
                  {contact.email || 'Lawalcy68@gmail.com'}
                </a>
                <p className="text-xs font-sans text-white/50 tracking-wider pt-2 leading-relaxed">
                  Showroom: {contact.address || 'Jos, Plateau State'}
                </p>
              </div>
            </PopOut>

            {/* Direct Action Buttons with late-pop */}
            <PopOut direction="late-pop" delay={0.2}>
              <div className="flex flex-wrap gap-4 pt-4">
                {contact.phone1 && (
                  <a
                    href={`tel:${contact.phone1.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 min-w-[120px] bg-[#1a1a1a] hover:bg-[#c5a059] hover:text-[#121212] border border-white/20 text-[#e5e2db] py-4 px-6 rounded-full text-xs uppercase tracking-[0.2em] text-center font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Us</span>
                  </a>
                )}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] bg-[#25D366] hover:bg-[#1faa53] text-white py-4 px-6 rounded-full text-xs uppercase tracking-[0.2em] text-center font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="w-full sm:w-auto bg-[#1a1a1a] hover:bg-white/10 border border-white/20 text-[#e5e2db] py-4 px-6 rounded-full text-xs uppercase tracking-[0.2em] text-center font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {/* Social Channels Row */}
              <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                  Follow Our Workshop On Social Media
                </span>
                <SocialLinksGroup variant="footer" />
              </div>
            </PopOut>
          </div>

          {/* Right: Contact Form in 3D Card */}
          <div className="lg:col-span-7">
            <PopOut direction="pop-out" delay={0.15}>
              <Card3D depth={4} scaleOnHover={1.01} elevateZ={16} className="rounded-3xl">
                <div className="bg-[#161616] p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
            {submitted ? (
              <div className="py-16 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#e5e2db]">Thank you for your enquiry.</h3>
                <p className="text-[#b0aca3] text-sm max-w-md mx-auto leading-relaxed">
                  Our artisan team has received your project specifications and will review material recommendations and timelines promptly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-[#e5e2db] px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
                  >
                    Submit Another Consultation Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {errors.general && (
                  <div className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-500/40 rounded-2xl text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errors.general}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-medium">
                      Your Full Name *
                    </label>
                    {errors.name && (
                      <span className="text-[11px] text-red-400">{errors.name}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full bg-[#121212] border rounded-2xl px-5 py-4 text-sm text-[#e5e2db] placeholder-white/30 focus:outline-none transition-colors ${
                      errors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#c5a059]'
                    }`}
                    placeholder="e.g. Aliko Johnson"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#c5a059] mb-2 font-medium">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 text-sm text-[#e5e2db] placeholder-white/30 focus:outline-none focus:border-[#c5a059] transition-colors"
                      placeholder="e.g. +234 801 234 5678"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-medium">
                        Email Address *
                      </label>
                      {errors.email && (
                        <span className="text-[11px] text-red-400">{errors.email}</span>
                      )}
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`w-full bg-[#121212] border rounded-2xl px-5 py-4 text-sm text-[#e5e2db] placeholder-white/30 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#c5a059]'
                      }`}
                      placeholder="e.g. client@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-medium">
                      Project Requirements & Dimensions *
                    </label>
                    {errors.message && (
                      <span className="text-[11px] text-red-400">{errors.message}</span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    className={`w-full bg-[#121212] border rounded-2xl p-5 text-sm text-[#e5e2db] placeholder-white/30 focus:outline-none transition-colors resize-none ${
                      errors.message ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#c5a059]'
                    }`}
                    placeholder="Describe your bespoke furniture specifications, space dimensions, timber preferences, or interior ideas..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#c5a059] hover:bg-[#b08e4c] text-[#121212] font-semibold py-4 px-8 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Consultation Details...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Project Consultation Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
                </div>
              </Card3D>
            </PopOut>
          </div>
        </div>
      </div>
    </section>
  );
}
