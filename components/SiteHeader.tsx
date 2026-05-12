"use client";

import { useState } from "react";
import Link from "next/link";

export default function SiteHeader({ user, selectedCategory }: { user: any; selectedCategory?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = ["festival", "food", "music", "sports", "art", "workshop", "market", "other"];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="w-6 h-6 bg-lime-600 rounded flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xs leading-none">+</span>
          </div>
          <p className="text-xl font-black tracking-tighter text-slate-900 uppercase">mine<span className="text-lime-600">.</span></p>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-900 transition-colors hover:text-lime-600"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* ハンバーガーメニューの中身 */}
      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-white border-b border-slate-100 shadow-2xl p-6 md:p-8 flex flex-col gap-8 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-50 pb-2">Menu</p>
            <Link href="/events/new" onClick={() => setIsOpen(false)} className="text-sm font-black text-slate-900 uppercase tracking-widest hover:text-lime-600 transition-colors">
              + Create New Event
            </Link>
            {user ? (
              <form action="/auth/signout" method="post" onSubmit={() => setIsOpen(false)}>
                <button className="text-sm font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors">Logout</button>
              </form>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-black text-slate-900 uppercase tracking-widest hover:text-lime-600 transition-colors">Login</Link>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-50 pb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/" onClick={() => setIsOpen(false)} className={`rounded-full px-4 py-2 text-[8px] font-black tracking-widest transition-all ${!selectedCategory ? "bg-lime-600 text-white shadow-md shadow-lime-600/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>ALL</Link>
              {categories.map(id => (
                <Link key={id} href={`/?category=${id}`} onClick={() => setIsOpen(false)} className={`rounded-full px-4 py-2 text-[8px] font-black tracking-widest transition-all uppercase ${selectedCategory === id ? "bg-lime-600 text-white shadow-md shadow-lime-600/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>{id}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}