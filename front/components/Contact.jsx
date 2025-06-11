import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Votre message a été envoyé avec succès !");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="dark:text-gray-100 w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-green-600 to-green-800 p-8 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-900">
      <div className="w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-center text-white dark:text-gray-100">Contactez-nous</h2>
        <p className="text-center text-gray-200 mt-2 dark:text-gray-300">
          Une question ? Remplissez le formulaire et nous vous répondrons rapidement.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nom et Prénom"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-300 placeholder-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Adresse Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-300 placeholder-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              required
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Sujet"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-300 placeholder-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            required
          />
          <textarea
            name="message"
            placeholder="Votre message..."
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-300 placeholder-gray-200 h-32 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-100 text-green-800 font-semibold py-3 rounded-lg transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
          >
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
