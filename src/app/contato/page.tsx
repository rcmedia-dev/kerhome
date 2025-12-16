"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Sparkle, AlertCircle, Send, ArrowRight, MessageSquare } from "lucide-react";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";

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
        rows={6}
        required
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 resize-none"
      />
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        required
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
      />
    )}
  </div>
);

// ==========================
// Informações de Contato
// ==========================
const ContactInfo = () => (
  <div className="space-y-12">
    <div>
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
        <MessageSquare size={16} />
        Fale Conosco
      </span>
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
        Vamos <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
          Conversar?
        </span>
      </h1>
      <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
        Estamos prontos para transformar seus sonhos imobiliários em realidade. Entre em contacto e descubra o padrão KerCasa de atendimento.
      </p>
    </div>

    <div className="space-y-8">
      <a href="tel:+244929884781" className="flex items-start gap-6 group p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner">
          <Phone className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Telefone</h3>
          <p className="text-gray-600 font-medium">+244 929 884 781</p>
          <span className="text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
            Ligar agora <ArrowRight size={14} />
          </span>
        </div>
      </a>

      <a href="mailto:geral@rcmedia.ao" className="flex items-start gap-6 group p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-inner">
          <Mail className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
          <p className="text-gray-600 font-medium">geral@rcmedia.ao</p>
          <span className="text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
            Enviar email <ArrowRight size={14} />
          </span>
        </div>
      </a>

      <div className="flex items-start gap-6 group p-4 -ml-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
          <MapPin className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Escritório</h3>
          <p className="text-gray-600 font-medium max-w-xs">
            Largo do Kinaxixi, Primeira Conservatória do Registro Civil
          </p>
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
    <div className="relative">
      {/* Decorative Blob */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Envie uma mensagem</h2>
          <p className="text-gray-500">Preencha o formulário abaixo e retornaremos em breve.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField id="name" label="Nome Completo" type="text" placeholder="Como podemos chamar você?" />
          <FormField id="email" label="Email Profissional" type="email" placeholder="seu@email.com" />
          <FormField id="message" label="Mensagem" placeholder="Conte-nos sobre o que precisa..." isTextarea />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl flex items-center justify-center gap-3 group"
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
        </form>

        {statusMessage.type && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl mt-6 text-sm font-medium shadow-lg backdrop-blur-sm ${statusMessage.type === "success"
                ? "bg-green-100/80 text-green-800 border border-green-200"
                : "bg-red-100/80 text-red-800 border border-red-200"
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
      </div>
    </div>
  );
};

// ==========================
// Página Principal
// ==========================
export default function ContactPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-purple-100/50 via-white to-orange-50/50 opacity-60"></div>
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
