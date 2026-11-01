# Kangaroo Pocket

필요한 순간 다시 꺼내 쓰는 개인 클립 보관함입니다.

## 현재 포함된 기능
- 텍스트와 웹 링크 저장
- 브라우저 로컬 저장소에 자동 보관
- 클립 검색
- 즐겨찾기(고정) 및 삭제
- 클릭 한 번으로 클립보드에 복사
- 모바일 화면 대응 및 PWA 기본 설정

## 실행 방법
Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## Vercel 배포
1. GitHub 저장소 `essential20102/Kangaroo-Pocket`에 이 프로젝트 파일을 업로드합니다.
2. Vercel에서 해당 GitHub 저장소를 Import합니다.
3. Framework Preset은 Next.js, Build Command는 `npm run build`로 둔 채 Deploy를 누릅니다.

## 데이터 저장 안내
현재 버전은 데이터를 사용하는 브라우저의 localStorage에 저장합니다. 따라서 다른 기기와 자동 동기화되지는 않습니다. 계정 로그인과 클라우드 동기화는 다음 단계에서 추가할 수 있습니다.

## iPhone에서 앱처럼 사용하기
Vercel 배포 후 iPhone Safari에서 사이트를 열고 공유 메뉴 → 홈 화면에 추가를 선택합니다.
