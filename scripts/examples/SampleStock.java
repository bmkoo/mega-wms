package com.inno.axboot.admin.domain.sample;

// genPage.mjs 예제 엔티티. 생성기가 읽는 경우를 한 파일에 모아 두었다 (실제 백엔드에는 없는 클래스).
// 사용법과 실제 출력은 같은 폴더의 README.md 참고.

import com.inno.axboot.admin.code.Types;
import com.inno.axboot.admin.domain.SimpleJpaModel;
import com.inno.axboot.core.annotations.Comment;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@DynamicInsert
@DynamicUpdate
@Entity
@EqualsAndHashCode(callSuper = true)
@Table(name = "TB_SAMPLE_STOCK")
@Comment(value = "예제 재고")                                   // → menu.sampleStock = '예제 재고'
@IdClass(SampleStock.SampleStockId.class)
public class SampleStock extends SimpleJpaModel<SampleStock.SampleStockId> {

    // ── @Id 가 2개 (복합키) → 상세 팝업 id = "whCd,itemNo" , 폼에서 수정 불가
    @Id
    @Column(name = "WH_CD", length = 10, nullable = false)
    @Comment(value = "창고코드")
    private String whCd;                                         // 문자열, length ≤ 10 → 폭 90

    @Id
    @Column(name = "ITEM_NO", precision = 19, nullable = false)
    @Comment(value = "품목번호")
    private Long itemNo;                                         // 숫자 @Id → id: true (콤마 없음)

    // ── 문자열
    @Column(name = "ITEM_NM", length = 130)
    @Comment(value = "품목명(판매처 원문)")                      // @Comment 안의 괄호도 읽는다
    private String itemNm;                                       // length ≥ 100 → 폭 220

    // ── 숫자 → 목록·폼에서 1000 단위 콤마
    @Column(name = "QTY", precision = 10)
    @Comment(value = "재고수량")
    private Integer qty;

    @Column(name = "PRICE", precision = 15, scale = 2)
    @Comment(value = "단가")
    private BigDecimal price;

    // ── 날짜 → 목록 YYYY-MM-DD HH:mm:ss, 검색 기간, 폼 날짜 선택
    @Column(name = "RECEIVED_AT")
    @Comment(value = "입고일시")
    private LocalDateTime receivedAt;                            // 저장 형식 YYYY-MM-DDTHH:mm:ss

    @Column(name = "EXPIRE_DATE")
    @Comment(value = "유통기한")
    private LocalDate expireDate;                                // 저장 형식 YYYY-MM-DD

    // ── 컬럼명이 _CODE 로 끝나는 문자열 → --code-status 이면 공통코드 필드 (그룹 STOCK_STATUS_CODE)
    @Column(name = "STOCK_STATUS_CODE", length = 10)
    @Comment(value = "재고상태")
    private String stockStatusCode;

    // ── 점이 들어간 타입 + 초기값 → 문자열로 읽는다 (컬럼명이 _CODE 로 끝나지 않으므로 공통코드 아님)
    @Column(name = "USE_YN", length = 1)
    @Comment(value = "사용여부")
    @Type(type = "labelEnum")
    private Types.Used useYn = Types.Used.YES;

    // ── @Column 이 없는 필드 → 화면에서 제외
    @Transient
    private String tempMemo;

    @Override
    public SampleStockId getId() {
        return SampleStockId.of(whCd, itemNo);
    }

    // ── @IdClass 내부 클래스의 필드는 @Column 이 없으므로 제외
    @Embeddable
    @Data
    @NoArgsConstructor
    @RequiredArgsConstructor(staticName = "of")
    public static class SampleStockId implements Serializable {
        @NonNull
        private String whCd;

        @NonNull
        private Long itemNo;
    }
}
