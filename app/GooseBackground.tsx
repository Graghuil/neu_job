// 白鹅 + 黄白背景 —— 纯 SVG，无外部图片依赖
export function GooseBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 黄白渐变底色 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-yellow-100 to-amber-200" />
      {/* 暖色光晕 */}
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-yellow-200/50 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-white/40 blur-3xl" />

      {/* 白鹅剪影 */}
      <svg
        className="absolute bottom-0 right-4 w-[46vw] max-w-2xl drop-shadow-sm"
        viewBox="0 0 480 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 身体 */}
        <path
          d="M120 360 C 70 350, 50 300, 80 250 C 100 215, 150 200, 210 210 C 250 217, 280 200, 300 175 C 290 150, 295 120, 320 105 C 318 130, 330 145, 350 150 C 360 152, 372 160, 372 175 C 372 192, 358 205, 335 208 C 360 235, 380 290, 350 340 C 330 372, 270 385, 210 380 C 175 377, 140 372, 120 360 Z"
          fill="white"
        />
        {/* 颈部高光分隔 */}
        <path
          d="M300 175 C 292 150, 298 124, 320 108"
          stroke="#fef3c7"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* 鹅嘴（橙色） */}
        <path
          d="M372 168 C 392 164, 408 168, 410 178 C 408 188, 392 190, 372 184 Z"
          fill="#f97316"
        />
        {/* 嘴上肉瘤 */}
        <circle cx="356" cy="150" r="9" fill="#f59e0b" />
        {/* 眼睛 */}
        <circle cx="346" cy="168" r="5" fill="#1c1917" />
        {/* 翅膀线条 */}
        <path
          d="M150 270 C 200 250, 270 252, 320 285"
          stroke="#fde68a"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M165 300 C 215 285, 275 288, 315 312"
          stroke="#fde68a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* 漂浮的羽毛/光点 */}
      <div className="absolute left-1/4 top-24 h-3 w-3 rounded-full bg-white/70" />
      <div className="absolute left-1/3 top-40 h-2 w-2 rounded-full bg-white/60" />
      <div className="absolute right-1/4 top-1/4 h-4 w-4 rounded-full bg-white/50" />
    </div>
  );
}
