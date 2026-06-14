// 蓝鲸海洋背景 —— 纯 SVG，无外部图片依赖
export function WhaleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 海洋渐变底色 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-600 to-blue-900" />
      {/* 光晕 */}
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" />

      {/* 鲸鱼剪影 */}
      <svg
        className="absolute bottom-0 right-0 w-[60vw] max-w-3xl opacity-20"
        viewBox="0 0 600 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 200 C 90 120, 230 90, 340 130 C 400 100, 430 60, 470 70 C 450 100, 460 130, 480 140 C 540 150, 580 190, 575 220 C 560 250, 500 255, 460 248 C 360 290, 180 300, 90 255 C 55 238, 35 220, 40 200 Z"
          fill="white"
        />
        {/* 鲸鱼眼睛 */}
        <circle cx="130" cy="200" r="8" fill="#0c4a6e" />
        {/* 尾鳍 */}
        <path
          d="M40 200 C 10 170, 0 150, 12 140 C 25 155, 35 170, 40 185 C 30 160, 28 150, 38 148 C 50 165, 55 185, 50 205 Z"
          fill="white"
        />
        {/* 喷水 */}
        <path
          d="M450 70 C 448 45, 460 30, 455 12"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M468 72 C 472 50, 485 40, 488 22"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* 气泡 */}
      <div className="absolute bottom-10 left-1/4 h-3 w-3 rounded-full bg-white/40" />
      <div className="absolute bottom-32 left-1/3 h-2 w-2 rounded-full bg-white/30" />
      <div className="absolute bottom-24 left-1/2 h-4 w-4 rounded-full bg-white/30" />
    </div>
  );
}
