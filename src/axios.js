import axios from 'axios';

// 개별 요청마다 토큰/BaseURL 이 달라질 수 있어 공용 인스턴스는 비어 있는 상태로 둔다.
// 실제 호출은 @/common/utils/apiFunctions 를 사용한다.
export default axios.create({});
