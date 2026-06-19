export default function Loading() {
    return (
      <div className="fixed inset-0 bg-[#F8F9FA] flex flex-col items-center justify-center z-50">
        {/* ふわふわ動くローディングアニメーション */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-lime-600 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-600/20 animate-bounce">
            <span className="text-white font-black text-2xl leading-none">+</span>
          </div>
          <p className="text-sm font-black tracking-widest text-slate-400 uppercase animate-pulse">
            Loading mine<span className="text-lime-600">.</span>
          </p>
        </div>
      </div>
    );
  }