# 02. UI/UX Guidelines

## 1. 디자인 시스템 (Design System)
본 프로젝트는 **Claymorphism (클레이모피즘)** 스타일을 기반으로 하여, 부드럽고 친근하며 만지고 싶은 3D 느낌의 UI를 구현합니다.

### 1.1. Claymorphism 특징
- **부드러운 곡선:** 모든 카드와 버튼은 큰 반경의 둥근 모서리(`rounded-2xl`, `rounded-3xl`)를 가집니다.
- **입체적인 그림자:** 외부 드롭 섀도우(Drop Shadow)와 내부 섀도우(Inner Shadow)를 결합하여 점토(Clay)처럼 튀어나오거나 들어간 느낌을 줍니다.
- **파스텔 톤 컬러:** 눈이 편안한 부드러운 배경색과 포인트 컬러를 사용합니다.

### 1.2. Color Palette (Tailwind 기준)
- **Background:** `bg-slate-50` 또는 `bg-neutral-100` (따뜻한 회색/베이지 톤)
- **Primary (포인트):** `bg-rose-400` 또는 `bg-pink-500` (웨딩의 로맨틱한 느낌)
- **Card Surface:** `bg-white` (클레이 섀도우 적용)
- **Text:** `text-slate-800` (기본), `text-slate-500` (보조)

### 1.3. Typography
- 모바일 환경에 맞게 큼직하고 가독성 높은 폰트 사이즈 적용.
- 제목은 `font-bold`, 본문은 `font-medium` 위주로 사용하여 또렷한 인상 제공.

## 2. 컴포넌트 가이드 (Component Guide)
- **Clay Card:**
  - `box-shadow: 8px 8px 16px rgba(0,0,0,0.06), -8px -8px 16px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(255,255,255,0.5), inset -2px -2px 4px rgba(0,0,0,0.02);`
- **Clay Button:**
  - 눌렸을 때(Active) 내부 섀도우가 강조되어 실제로 들어가는 듯한 피드백 제공.
- **Bottom Navigation:**
  - 화면 하단에 고정되며, 현재 위치한 탭을 아이콘과 색상으로 명확히 표시.
- **Segmented Control / Radio Group:**
  - 만족/보통/불만족 등을 선택할 때 텍스트 입력 대신 터치하기 쉬운 둥근 버튼 그룹 사용.

## 3. 레이아웃 (Layout)
- `max-w-md mx-auto`: 모바일 앱 화면 비율(가로 최대 448px)을 유지하여 데스크탑에서도 모바일 뷰어처럼 보이도록 구성.
- 하단 네비게이션 바 영역(`pb-20`)을 확보하여 콘텐츠가 가려지지 않도록 처리.
