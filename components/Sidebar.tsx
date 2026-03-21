'use client'

const navItems = [
  { id: 'section1', label: 'Revenue & Sales', icon: '📊' },
  { id: 'section2', label: 'Product Performance', icon: '🛒' },
  { id: 'section3', label: 'Customer Segments', icon: '👥' },
  { id: 'section4', label: 'Payment & Channel', icon: '💳' },
]

export default function Sidebar({ lastUpdated }: { lastUpdated: string }) {
  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-[#1a1d2e] border-r border-[rgba(255,255,255,0.07)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
            BI
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">RetailBI</p>
            <p className="text-[11px] text-white/40 mt-0.5">Analytics Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Sections
        </p>
        {navItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
          >
            <span className="text-base leading-none group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.07)]">
        <p className="text-[10px] text-white/25 uppercase tracking-wider">Last updated</p>
        <p className="text-xs text-white/50 mt-0.5 font-medium">{lastUpdated}</p>
      </div>
    </aside>
  )
}
