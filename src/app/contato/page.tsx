"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Sparkle, AlertCircle } from "lucide-react";
import emailjs from "emailjs-com";

// ==========================
// Campo do Formulário
// ==========================
type FormFieldProps = {
  id: string;
  type?: string;
  placeholder: string;
  isTextarea?: boolean;
};

const FormField = ({ id, type = "text", placeholder, isTextarea = false }: FormFieldProps) => (
  <div>
    {isTextarea ? (
      <textarea
        id={id}
        name={id} // 🔑 precisa bater com os campos do template no EmailJS
        rows={5}
        required
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700 resize-none"
      />
    ) : (
      <input
        id={id}
        name={id} // 🔑 precisa bater com os campos do template no EmailJS
        type={type}
        required
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
      />
    )}
  </div>
);

// ==========================
// Informações de Contato
// ==========================
const ContactInfo = () => (
  <div className="space-y-8">
    <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
      Entre em contacto <br />
      com a{" "}
      <span className="text-purple-700">
        Ker<span className="text-orange-500">casa</span>
      </span>
    </h1>

    <p className="text-lg text-gray-600 max-w-lg">
      Precisa de ajuda com a compra, venda ou aluguel de um imóvel? Nossa equipe está pronta
      para atendê-lo com profissionalismo e agilidade.
    </p>

    <div className="space-y-5 text-gray-700 text-base">
      <div className="flex items-center gap-4">
        <Phone className="text-orange-500 w-5 h-5" />
        <span>+244 929 884 781</span>
      </div>
      <div className="flex items-center gap-4">
        <Mail className="text-orange-500 w-5 h-5" />
        <span>geral@rcmedia.ao</span>
      </div>
      <div className="flex items-center gap-4">
        <MapPin className="text-orange-500 w-5 h-5" />
        <span>Largo do Kinaxixi, Primeira Conservatória do Registro Civil</span>
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
        form.reset(); // ✅ limpa os campos do formulário

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
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Envie sua mensagem</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="name" type="text" placeholder="Seu Nome" />
        <FormField id="email" type="email" placeholder="Seu Email" />
        <FormField id="message" placeholder="Sua Mensagem" isTextarea />

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition duration-300 shadow-md disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar Mensagem"}
        </button>
      </form>

      {statusMessage.type && (
        <span
          className={`flex items-center gap-2 px-6 py-4 rounded-md mt-4 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Sparkle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {statusMessage.text}
        </span>
      )}
    </div>
  );
};

// ==========================
// Página Principal
// ==========================
export default function ContactPage() {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-white min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <ContactInfo />
        <ContactForm />
      </div>
    </section>
  );
}
