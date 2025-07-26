package cms.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common Errors (CM_xxxx)
    INTERNAL_SERVER_ERROR("CM_0001", "서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_INPUT_VALUE("CM_0002", "입력값이 유효하지 않습니다. 다시 확인해주세요.", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED("CM_0003", "요청에 대한 접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    AUTHENTICATION_FAILED("CM_0004", "로그인이 필요한 서비스입니다. 로그인 후 이용해 주세요.", HttpStatus.UNAUTHORIZED),
    SESSION_EXPIRED("CM_0005", "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.", HttpStatus.UNAUTHORIZED),
    RESOURCE_NOT_FOUND("CM_0006", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED("CM_0007", "허용되지 않은 HTTP 메소드입니다.", HttpStatus.METHOD_NOT_ALLOWED),
    REQUEST_TIMEOUT("CM_0008", "요청 처리 시간이 초과되었습니다.", HttpStatus.REQUEST_TIMEOUT),
    SERVICE_UNAVAILABLE("CM_0009", "현재 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.", HttpStatus.SERVICE_UNAVAILABLE),
    DATA_INTEGRITY_VIOLATION("CM_0010", "데이터 무결성 제약조건을 위반했습니다. 입력값을 확인해주세요.", HttpStatus.CONFLICT),
    INVALID_REQUEST("CM_0011", "잘못된 요청입니다.", HttpStatus.BAD_REQUEST),

    // User Errors (US_xxxx)
    USER_NOT_FOUND("US_0001", "해당 사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    DUPLICATE_USERNAME("US_0002", "이미 사용 중인 사용자 ID입니다.", HttpStatus.CONFLICT), // username 중복은 DUPLICATE_USERNAME 사용
    DUPLICATE_EMAIL("US_0003", "이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT), // email 중복은 DUPLICATE_EMAIL 사용
    PASSWORD_MISMATCH("US_0004", "비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD_FORMAT("US_0005", "비밀번호 형식이 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED("US_0006", "계정이 잠겼습니다. 관리자에게 문의하세요.", HttpStatus.FORBIDDEN),
    ACCOUNT_EXPIRED("US_0007", "계정이 만료되었습니다.", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED("US_0008", "비활성화된 계정입니다.", HttpStatus.FORBIDDEN),
    INVALID_USER_GENDER("US_0009", "사용자의 성별 코드가 유효하지 않습니다.", HttpStatus.BAD_REQUEST),
    DUPLICATE_DI("US_0010", "이미 해당 본인인증 정보로 가입된 계정이 존재합니다.", HttpStatus.CONFLICT),
    INVALID_CURRENT_PASSWORD("US_0011", "현재 비밀번호가 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
    PROFILE_UPDATE_FAILED("US_0012", "프로필 업데이트 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    TEMP_PASSWORD_ISSUE_FAILED("US_0013", "임시 비밀번호 발급 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // NICE Verification Errors (NV_xxxx)
    NICE_VERIFICATION_FAILED("NV_0001", "NICE 본인인증에 실패했거나 인증 정보가 만료되었습니다.", HttpStatus.BAD_REQUEST),
    NICE_VERIFICATION_MISSING_KEY("NV_0002", "NICE 본인인증 정보가 누락되었습니다. 본인인증을 다시 진행해주세요.", HttpStatus.BAD_REQUEST),
    NICE_VERIFICATION_ERROR("NV_0003", "NICE 본인인증 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // File Errors (FL_xxxx)
    FILE_UPLOAD_FAILED("FL_0001", "파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND("FL_0002", "파일을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INVALID_FILE_FORMAT("FL_0003", "지원하지 않는 파일 형식입니다.", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED("FL_0004", "파일 크기가 너무 큽니다.", HttpStatus.PAYLOAD_TOO_LARGE),

    // Template Errors (TP_xxxx)
    TEMPLATE_NOT_FOUND("TP_0001", "템플릿을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;
}