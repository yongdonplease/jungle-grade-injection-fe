import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppTitle } from "@/config/constants";

function LandingPage() {
  const [show, setShow] = useState(false);
  const appTitle = getAppTitle();

  useEffect(() => {
    document.title = appTitle;
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, [appTitle]);

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center px-0 text-center">
      <h1
        className={[
          "mb-6 font-extrabold text-gray-900 leading-tight",
          "text-4xl sm:text-6xl md:text-7xl",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          "transition-all duration-700 ease-out",
        ].join(" ")}
      >
        {appTitle}
      </h1>

      <p
        className={[
          "mb-10 text-gray-600",
          "text-lg md:text-xl",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
          "transition-all delay-100 duration-700 ease-out",
        ].join(" ")}
      >
        대학생들을 위한 학습용 AI 서비스
      </p>

      <div
        className={[
          "flex flex-col gap-4 sm:flex-row",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
          "transition-all delay-200 duration-700 ease-out",
        ].join(" ")}
      >
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-12 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login
        </Link>
      </div>
    </main>
  );
}

export default LandingPage;
