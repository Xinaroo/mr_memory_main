# MR Main Study GitHub Pages 웹앱

## 폴더 구조

```text
MR_MainStudy_GitHubPages/
├─ index.html
├─ config.js
├─ schedule.js
├─ images/
│  ├─ layout_01.png
│  ├─ layout_02.png
│  ├─ ...
│  └─ layout_60.png
└─ apps-script/
   └─ Code.gs
```

`images` 폴더에는 `layout_01.png`부터 `layout_60.png`까지 정확한 이름으로 넣습니다.
현재 시행의 `source_set_number`가 1이면 `images/layout_01.png`, 43이면
`images/layout_43.png`를 표시합니다.

## 기능

- P001–P028 참가자 ID별 21개 시행 순서 조회
- 한국어 SBSOD 15문항
- SBSOD 역채점 및 평균 자동 계산
- 9-block forward Corsi 과제와 trial-level 로그
- VR/MR 사용 경험 설문
- 연구자용 block, 조건, layout 이미지 표시
- Google Sheets 자동 기록
- 네트워크 오류에 대비한 브라우저 localStorage 백업

## 1. GitHub 저장소 만들기

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 파일을 저장소 최상위에 업로드합니다.
3. `images` 폴더에 60개 이미지를 넣습니다.
4. 저장소의 `Settings → Pages`로 이동합니다.
5. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
6. Branch는 `main`, 폴더는 `/(root)`를 선택하고 저장합니다.
7. 표시되는 GitHub Pages 주소로 접속합니다.

빌드 도구가 없는 정적 사이트이므로 별도의 npm 설치나 GitHub Actions는 필요하지 않습니다.

## 2. Google Sheet 만들기

1. 새 Google Sheet를 만듭니다.
2. URL의 `/d/`와 `/edit` 사이 문자열을 복사합니다.
3. Sheet에서 `확장 프로그램 → Apps Script`를 엽니다.
4. `apps-script/Code.gs` 내용을 붙여넣습니다.
5. 첫 줄의 Sheet ID를 교체합니다.

```javascript
const SPREADSHEET_ID = '복사한_ID';
```

## 3. Apps Script를 기록 API로 배포하기

1. Apps Script 오른쪽 위 `배포 → 새 배포`를 누릅니다.
2. 유형은 `웹 앱`을 선택합니다.
3. 실행 사용자는 `나`로 설정합니다.
4. 액세스 권한은 실험용 기기에서 접근 가능한 옵션으로 설정합니다.
5. 배포하고 권한을 승인합니다.
6. 발급된 주소 중 `/exec`로 끝나는 주소를 복사합니다.
7. GitHub 저장소의 `config.js`에서 다음 값을 교체합니다.

```javascript
GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/.../exec"
```

8. 변경한 `config.js`를 commit합니다.

## 4. 기록되는 Sheet 탭

첫 기록이 들어올 때 자동으로 생성됩니다.

- `session_events`
- `sbsod`
- `corsi_summary`
- `vr_mr_experience`
- `schedule_events`

## 5. 한국어 SBSOD

제공된 한국어 문항을 자연스럽게 다듬어 반영했습니다. 응답은 다음과 같습니다.

- 1: 매우 그렇다
- 7: 전혀 그렇지 않다
- 역채점 문항: 1, 3, 4, 5, 7, 9, 14
- 최종 점수: 역채점 후 15문항 평균
- 점수가 높을수록 주관적 방향 감각이 좋음을 의미

이 문항은 사용자가 제시한 국내 문헌의 번역을 바탕으로 표현을 다듬은 버전입니다.
검증된 독립 한국어판인지 여부는 별도로 확인해야 하므로 논문에서는 “Korean-translated
SBSOD”와 번역 출처 및 절차를 명시하는 편이 안전합니다.

## 6. Corsi 설정

- 9개 블록
- 제시된 순서대로 회상하는 forward 방식
- 길이 2부터 시작
- 각 길이에서 2회 시행
- 같은 길이에서 2회 실패하면 종료
- 최대 성공 길이, 전체 정답 수, 각 시행의 제시 및 클릭 순서 저장

표준화 검사와 동일하다고 단정하지 말고, Methods에 구현 및 중단 규칙을 직접 기술합니다.

## 7. 중요한 운영상 주의점

GitHub Pages는 정적 사이트이므로 Google Sheet ID나 인증정보를 `config.js`에 넣지 않습니다.
프런트엔드에는 Apps Script `/exec` 주소만 들어갑니다.

현재 저장 요청은 Apps Script로 전송하는 동시에 브라우저 localStorage에도 백업합니다.
Chrome 개발자 도구의 Application → Local storage에서 `mr_backup_P001` 같은 키로 확인할 수 있습니다.

참가자가 layout을 보지 않아야 한다면 `config.js`의 값을 다음처럼 바꿉니다.

```javascript
SHOW_RESEARCHER_PANEL: false
```

이 경우 Block 및 Layout 메뉴가 숨겨집니다. 연구자용 별도 브라우저에서는 true 버전을 사용하십시오.
