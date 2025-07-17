
function ContactForm() {
  return (
    <form className="space-y-5">
      <div className="relative">
        <input
          type="text"
          id="name"
          placeholder=" "
          required
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="name"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Nome
        </label>
      </div>

      <div className="relative">
        <input
          type="email"
          id="email"
          placeholder=" "
          required
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="email"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Email
        </label>
      </div>

      <div className="relative">
        <textarea
          id="message"
          placeholder=" "
          required
          rows={4}
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="message"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Mensagem
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow transition"
      >
        Enviar
      </button>
    </form>
  );
}
export default ContactForm;