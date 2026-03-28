# 03. Data Schema (Firestore)

기존 텍스트 위주의 스키마에서 정량적 평가(점수, 상태)가 가능한 구조로 개편합니다.

## Collection: `weddingHalls`

| Field | Type | Description | UI Component |
|---|---|---|---|
| `id` | String | Document ID | - |
| `coupleId` | String | 연결된 커플 ID | - |
| `authorId` | String | 최초 작성자 UID | - |
| `authorName` | String | 최초 작성자 이름 | - |
| `name` | String | 웨딩홀 이름 | Text Input |
| `subHallName` | String | 홀 이름 (예: 그랜드볼룸) | Text Input |
| `weddingTime` | String | 예식 시간 (예: 12:30) | Time Picker / Text |
| `location` | String | 주소 | Text Input (Map 연동) |
| `visitDate` | Timestamp | 방문/예식 예정일 | Date Picker |
| `status` | String | 상태 ('planned', 'visited', 'contracted') | Segmented Control |
| `rentalFee` | Number | 대관료 (만원) | Number Input / Stepper |
| `mealFee` | Number | 식대 (만원) | Number Input / Stepper |
| `guaranteedGuests`| Number | 보증인원 | Number Input / Stepper |
| `mealScore` | Number | 식사 만족도 (1~5) | Star Rating / Emoji |
| `parkingScore` | Number | 주차 만족도 (1~5) | Star Rating / Emoji |
| `atmosphereScore` | Number | 홀 분위기 만족도 (1~5) | Star Rating / Emoji |
| `trafficScore` | Number | 교통 만족도 (1~5) | Star Rating / Emoji |
| `brideRoomScore` | Number | 신부대기실 만족도 (1~5) | Star Rating / Emoji |
| `virginRoadScore` | Number | 버진로드 만족도 (1~5) | Star Rating / Emoji |
| `ceilingHeightScore` | Number | 층고 만족도 (1~5) | Star Rating / Emoji |
| `restroomScore` | Number | 화장실 청결도 (1~5) | Star Rating / Emoji |
| `flowScore` | Number | 동선 만족도 (1~5) | Star Rating / Emoji |
| `notes` | String | 상세 후기 및 메모 | Textarea |
| `createdAt` | Timestamp | 생성일시 | - |
| `updatedAt` | Timestamp | 수정일시 | - |

*기존의 `mealQuality`, `parking`, `virginRoad`, `restrooms`, `atmosphere`, `traffic` 텍스트 필드는 `notes`로 통합하거나, 정량적 점수(`*Score`)로 대체하여 비교 및 정렬이 용이하도록 합니다.*
