export const Manifesto = () => {
  return (
    <section className="bg-[#1a1a1a] text-[#f4f1ea] py-40 font-ui relative overflow-hidden">
      {/* GLITCH EFFECT BACKGROUND TEXT */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <span className="text-[30vw] font-black leading-none">CADMUS</span>
      </div>

      <div className="max-w-5xl mx-auto px-10 relative z-10">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-[2px] flex-1 bg-accent/30" />
          <span className="text-xs font-black tracking-[0.5em] text-accent uppercase">Operational_Manifesto</span>
          <div className="h-[2px] flex-1 bg-accent/30" />
        </div>

        <div className="space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4 text-4xl font-black tracking-tighter opacity-20">[ 01 ]</div>
            <div className="md:col-span-8 space-y-6">
              <h2 className="text-4xl font-black tracking-tight uppercase">Data is Infrastructure, not a Product.</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold tracking-wide uppercase">
                We reject the surveillance-based knowledge economy. Cadmus is built on the principle that your intellectual capital should never be leveraged by third parties.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4 text-4xl font-black tracking-tighter opacity-20">[ 02 ]</div>
            <div className="md:col-span-8 space-y-6">
              <h2 className="text-4xl font-black tracking-tight uppercase">Local-First is the standard.</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold tracking-wide uppercase">
                Connectivity should be an optimization, not a dependency. If the network fails, the operator must remain functional.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4 text-4xl font-black tracking-tighter opacity-20">[ 03 ]</div>
            <div className="md:col-span-8 space-y-6">
              <h2 className="text-4xl font-black tracking-tight uppercase">Atomic Truth.</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold tracking-wide uppercase">
                Every unit of data is traceable, verifiable, and permanent. We build systems that resist entropy and ensure structural integrity over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
