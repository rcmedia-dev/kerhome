"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Sparkle, AlertCircle, Send, ArrowRight, MessageSquare, Instagram, Facebook, Linkedin, Home } from "lucide-react";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";
import Image from "next/image";

// ==========================
// Campo do Formulário
// ==========================
type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  isTextarea?: boolean;
};

const FormField = ({ id, label, type = "text", placeholder, isTextarea = false }: FormFieldProps) => (
  <div className="group">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
      {label}
    </label>
    {isTextarea ? (
      <textarea
        id={id}
        name={id}
        rows={4}
        required
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 resize-none"
      />
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        required
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
      />
    )}
  </div>
);

// ==========================
// Informações de Contato (Minimizado)
// ==========================
const ContactDetails = () => (
  <div className="space-y-6 mt-12 border-t border-gray-100 pt-8">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Outras formas de contato</h3>

    <div className="grid gap-4 sm:grid-cols-2">
      <a href="tel:+244929884781" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
          <Phone className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Telefone</p>
          <p className="text-sm font-medium text-gray-900">+244 929 884 781</p>
        </div>
      </a>

      <a href="mailto:geral@rcmedia.ao" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-medium text-gray-900">geral@rcmedia.ao</p>
        </div>
      </a>

      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group sm:col-span-2">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Escritório</p>
          <p className="text-sm font-medium text-gray-900">Largo do Kinaxixi, Primeira Conservatória do Registro Civil</p>
        </div>
      </div>
    </div>
  </div>
);

// ==========================
// Formulário com EmailJS
// ==========================
const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID as string,
        form,
        process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY as string
      )
      .then(() => {
        setStatusMessage({ type: "success", text: "Mensagem enviada com sucesso!" });
        form.reset();

        setTimeout(() => setStatusMessage({ type: null, text: "" }), 4000);
      })
      .catch((error) => {
        console.error("❌ Erro ao enviar:", error);

        setStatusMessage({ type: "error", text: "Erro ao enviar mensagem." });
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 4000);
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField id="name" label="Nome Completo" type="text" placeholder="Como podemos chamar você?" />
      <FormField id="email" label="Email Profissional" type="email" placeholder="seu@email.com" />
      <FormField id="message" label="Mensagem" placeholder="Conte-nos sobre o que precisa..." isTextarea />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-[#820AD1] text-white font-bold text-lg hover:bg-[#6e08b0] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl flex items-center justify-center gap-3 group"
      >
        {loading ? (
          "Enviando..."
        ) : (
          <>
            Enviar Mensagem
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {statusMessage.type && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl mt-4 text-sm font-medium ${statusMessage.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {statusMessage.type === "success" ? (
            <Sparkle size={18} className="text-green-600" />
          ) : (
            <AlertCircle size={18} className="text-red-600" />
          )}
          {statusMessage.text}
        </motion.div>
      )}
    </form>
  );
};

// ==========================
// Componente de Redes Sociais
// ==========================
const SocialLinks = () => (
  <div className="flex gap-4 mt-8">
    {[
      { Icon: Instagram, href: "#" },
      { Icon: Facebook, href: "#" },
      { Icon: Linkedin, href: "#" }
    ].map((item, index) => (
      <a
        key={index}
        href={item.href}
        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 hover:bg-white hover:text-purple-900 text-white transition-all backdrop-blur-sm"
      >
        <item.Icon size={18} />
      </a>
    ))}
  </div>
)


// ==========================
// Página Principal
// ==========================
export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">

      {/* LEFT COLUMN - Visual & Brand */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto lg:min-h-screen bg-gray-900 flex flex-col justify-center p-8 md:p-12 lg:p-20 overflow-hidden order-1 lg:order-1">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/house.jpg"
            alt="Luxury Home"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
        </div>

        {/* Middle/Bottom Content */}
        <div className="relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold mb-6 uppercase tracking-wider backdrop-blur-md">
              Atendimento Premium
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Construindo<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Sonhos,</span> um Lar <br />
              de cada vez.
            </h1>
            <p className="text-gray-300 text-lg max-w-md leading-relaxed mx-auto lg:mx-0">
              Nossa equipe está pronta para oferecer a melhor experiência na busca pelo seu novo imóvel. Simplifique sua jornada com a KerCasa.
            </p>

            <SocialLinks />
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN - Form & Details */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 py-12 md:py-20 lg:p-24 overflow-y-auto order-2 lg:order-2">
        <div className="max-w-xl mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Fale Conosco</h2>
            <p className="text-gray-500 text-lg">
              Preencha o formulário abaixo e entraremos em contato brevemente.
            </p>
          </div>

          <ContactForm />

          <ContactDetails />
        </div>
      </div>

    </div>
  );
}
