import React from "react";
import Link from "next/link";
import { ShieldCheck, Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 text-slate-400 py-6 px-4 text-center text-xs">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-sky-400 font-medium">
          <ShieldCheck size={14} />
          <span>JEE Main 2026 PYQ Only</span>
        </div>

        <p className="text-slate-300 font-medium leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          Questions are from official NTA papers. Explanations are AI-generated and may contain errors. Verify with your teacher.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <Link href="/pattern" className="hover:text-slate-300 underline underline-offset-2">
            2026 Exam Pattern
          </Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-slate-300 underline underline-offset-2">
            Review & Audit
          </Link>
          <span>•</span>
          <a
            href="https://jeemain.nta.nic.in"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 underline underline-offset-2"
          >
            NTA Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
