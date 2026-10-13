import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#FAF9F6] flex items-center justify-center text-black  overflow-hidden">
      <div className="w-full md:max-w-4xl md:mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 md:p-8 space-y-10">
        
        
        <header className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">About Us</h1>
          <p className="text-lg text-black/80">Learn more about our mission, values, and team</p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-black/90 leading-relaxed">
            At <strong>[Your Company Name]</strong>, our mission is to provide innovative solutions that help people and businesses achieve their goals.
            We believe in creating user-centric products that make life easier, more productive, and enjoyable. Our team is passionate about quality, 
            creativity, and delivering results that exceed expectations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Who We Are</h2>
          <p className="text-black/90 leading-relaxed">
            We are a diverse group of professionals, including developers, designers, and strategists, who work collaboratively to build high-quality digital experiences. 
            With years of industry experience, we focus on developing cutting-edge technologies that drive growth and foster success for our clients.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Values</h2>
          <ul className="space-y-2 list-disc pl-5 text-black/90">
            <li><strong>Innovation:</strong> We are committed to continuous learning and embracing new ideas and technologies.</li>
            <li><strong>Integrity:</strong> We uphold transparency, honesty, and ethical practices in all aspects of our work.</li>
            <li><strong>Collaboration:</strong> We believe in the power of teamwork and open communication to achieve the best results.</li>
            <li><strong>Excellence:</strong> We strive to exceed expectations and deliver high-quality solutions in everything we do.</li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-3">Get in Touch</h2>
          <p className="text-black/90 mb-4">
            If you'd like to learn more about our services or have any questions, feel free to contact us. We’d love to hear from you!
          </p>
          <a
            href="/contact"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Contact Us
          </a>
        </section>

      </div>
    </div>
  );
};

export default About;
