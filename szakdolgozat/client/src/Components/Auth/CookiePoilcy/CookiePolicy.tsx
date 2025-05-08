import React from "react";
import { Link } from "react-router-dom";
//Ez a komponens megjeleníti a sütikkel kapcsolatos adatkezelési szabályokat
const CookiePolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>

      <p className="mb-4">
        This Cookie Policy explains how our website uses cookies and similar
        technologies to recognize you when you visit. It explains what these
        technologies are, why we use them, and your rights to control our use of
        them.
      </p>

      <h2 className="text-2xl font-semibold mb-2">What are cookies?</h2>
      <p className="mb-4">
        Cookies are small data files that are placed on your computer or mobile
        device when you visit a website. Cookies are widely used by website
        owners to make their websites work, or to work more efficiently, as well
        as to provide reporting information.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Why do we use cookies?</h2>
      <p className="mb-4">
        We use cookies to enable you to log in and stay logged in. Since this
        website does not have a guest mode, cookies are essential for providing
        you with a seamless and secure experience while using our services.
      </p>

      <h2 className="text-2xl font-semibold mb-2">
        Your choices regarding cookies
      </h2>
      <p className="mb-4">
        You can control or disable cookies through your browser settings at any
        time. However, please note that if you disable cookies, the site won't
        function properly.
      </p>

      <a
        className="underline"
        href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
        target="_blank"
      >
        GDPR Source
      </a>

      <p className="text-sm text-gray-500 mt-5 mb-20">
        Last updated: May 2, 2025
      </p>

      <Link
        className="fixed bg-white p-2 rounded-lg border bottom-10 font-bold text-xl"
        to="/"
        reloadDocument
      >
        {"<"}Back
      </Link>
    </div>
  );
};

export default CookiePolicy;
