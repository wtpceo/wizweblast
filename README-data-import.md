# 광고주 관리 시스템 데이터 가져오기 가이드

실제 광고주 관리 시스템을 사용하기 위한 데이터 초기화 및 샘플 데이터 가져오기 가이드입니다.

## 1. 기존 데이터 초기화하기

### Supabase SQL Editor에서 실행

Supabase 대시보드의 SQL Editor에서 `clean-clients-data.sql` 파일의 내용을 실행하여 기존 데이터를 모두 초기화합니다.

1. [Supabase 대시보드](https://app.supabase.io)에 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 SQL Editor 클릭
4. New Query 버튼 클릭
5. `clean-clients-data.sql` 파일의 내용을 복사하여 붙여넣기
6. Run 버튼 클릭

## 2. 샘플 데이터 가져오기

### A. 광고주 데이터 가져오기

1. Supabase 대시보드에서 Table Editor 클릭
2. clients 테이블 선택
3. Import Data 버튼 클릭 
4. Insert 옵션 선택
5. CSV 파일 선택하고 `sample-clients.csv` 업로드
6. 열 매핑 확인 후 Import 클릭

### B. 메모 데이터 가져오기

메모 데이터는 광고주 데이터를 먼저 가져온 후에 가져와야 합니다.
샘플 파일의 `__CLIENT_ID_1__` 등의 값을 실제 광고주 ID로 변경해야 합니다.

1. 먼저 광고주 ID 확인:
   - Table Editor에서 clients 테이블 조회
   - ID 열의 값을 복사

2. `sample-notes.csv` 파일 수정:
   - `__CLIENT_ID_X__` 부분을 실제 광고주 ID로 변경
   - 예: `__CLIENT_ID_1__` → `550e8400-e29b-41d4-a716-446655440000`

3. 수정된 CSV 파일 가져오기:
   - Table Editor에서 client_notes 테이블 선택
   - Import Data → Insert 선택
   - 수정된 CSV 파일 업로드
   - 열 매핑 확인 후 Import 클릭

### C. 할 일 데이터 가져오기

할 일 데이터도 광고주 ID 참조가 필요합니다.

1. `sample-todos.csv` 파일 수정:
   - `__CLIENT_ID_X__` 부분을 실제 광고주 ID로 변경

2. 수정된 CSV 파일 가져오기:
   - Table Editor에서 client_todos 테이블 선택
   - Import Data → Insert 선택
   - 수정된 CSV 파일 업로드
   - 열 매핑 확인 후 Import 클릭

## 3. 데이터 확인하기

데이터를 가져온 후 웹 애플리케이션에서 제대로 표시되는지 확인합니다:

1. 브라우저에서 애플리케이션 접속
2. '광고주 관리' 페이지로 이동
3. '새로고침' 버튼 클릭하여 최신 데이터 로드
4. 가져온 데이터가 제대로 표시되는지 확인

## 4. 실제 데이터 가져오기

실제 광고주 데이터를 가져오려면:

1. `sample-clients.csv`와 같은 형식으로 CSV 파일 준비
2. 열 이름과 데이터 형식을 정확히 맞춰야 함
3. 위의 '광고주 데이터 가져오기' 절차를 따라 업로드

## 5. 문제 해결

데이터 가져오기에 문제가 있는 경우:

- 외래 키 제약 조건: 광고주 데이터를 먼저 가져온 후, 메모와 할 일 데이터를 가져와야 함
- CSV 형식: 쉼표(,)와 큰따옴표(") 처리에 주의
- 날짜 형식: 날짜는 ISO 8601 형식(YYYY-MM-DDThh:mm:ssZ)으로 작성
- 배열 데이터: 배열(예: status_tags)은 `{값1,값2}` 형식으로 작성 