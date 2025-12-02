package kr.soft.today.api;

import kr.soft.today.common.ApiResponse;
import kr.soft.today.service.KakaoApiService;
import kr.soft.today.service.NaverApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/")
public class KakaoController {

    @Autowired
    private KakaoApiService kakaoApiService;

    @Autowired
    private NaverApiService naverApiService;

    @Value("${naver.client-id:}")
    private String naverClientId;

    // 카카오 키 엔드포인트
    @PostMapping("/kakao/key")
    public ResponseEntity<ApiResponse<String>> kakao() {
        return ApiResponse.success("d303c87e51bef9b2c77ca152cd3e1a23");
    }

    // 네이버 키 엔드포인트
    @PostMapping("/naver/key")
    public ResponseEntity<ApiResponse<String>> naver() {
        // application.properties나 application.yml에서 가져온 네이버 클라이언트 ID 반환
        return ApiResponse.success(naverClientId);
    }

    // 카카오 콜백
    @GetMapping("/kakao/callback")
    public ResponseEntity<?> kakaoCallback(@RequestParam("code") String code) {
        try {
            log.info("카카오 인증 코드 받음: code={}", code);

            // 카카오에서 받은 인증 코드 (쿼리 파라미터)
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "status", 400,
                                "message", "인증 코드가 없습니다.",
                                "data", null
                        ));
            }

            // KakaoApiService를 사용하여 로그인 처리
            // 1. code를 액세스 토큰으로 교환
            String accessToken = kakaoApiService.getAccessToken(code);
            
            // 2. 액세스 토큰으로 사용자 정보(이메일) 조회
            Map<String, String> userInfo = kakaoApiService.getUserInfo(accessToken);
            String email = userInfo.get("email");

            log.info("카카오 이메일: {}", email);

            // 3. DB에서 이메일로 사용자 확인
            // User user = userRepository.findByEmail(email);
            // boolean userExists = (user != null);

            // 임시: 실제 구현 시 위 로직으로 확인
            boolean userExists = false; // DB에서 사용자 존재 여부 확인

            String frontendUrl;
            if (userExists) {
                // 사용자가 있으면 → 로그인 성공 (JWT 토큰 발급 후 전달)
                // String token = jwtTokenProvider.generateToken(user);
                String token = "your_jwt_token_here";
                frontendUrl = "http://localhost:5173/login?token=" + token;
            } else {
                // 사용자가 없으면 → 회원가입 페이지로 이동 (이메일 정보 전달)
                frontendUrl = "http://localhost:5173/login?email=" + email + "&from=kakao";
            }

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl))
                    .build();

        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 오류", e);
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "status", 500,
                            "message", "카카오 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(),
                            "data", null
                    ));
        }
    }

    // 네이버 콜백 (GET - 네이버 OAuth 표준 방식)
    @GetMapping("/naver/callback")
    public ResponseEntity<?> naverCallbackGet(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        return naverCallback(code, state);
    }

    // 네이버 콜백 (POST - 프론트엔드에서 호출하는 방식)
    @PostMapping("/naver/callback")
    public ResponseEntity<?> naverCallbackPost(@RequestBody Map<String, String> requestBody) {
        String code = requestBody.get("code");
        String state = requestBody.get("state");
        return naverCallback(code, state);
    }

    // 네이버 콜백 공통 처리 메서드
    private ResponseEntity<?> naverCallback(String code, String state) {
        try {
            log.info("네이버 인증 코드 받음: code={}, state={}", code, state);

            // 네이버에서 받은 인증 코드 (쿼리 파라미터)
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "status", 400,
                                "message", "인증 코드가 없습니다.",
                                "data", null
                        ));
            }

            // NaverApiService를 사용하여 로그인 처리
            // 1. code를 액세스 토큰으로 교환
            String accessToken = naverApiService.getAccessToken(code, state);
            
            // 2. 액세스 토큰으로 사용자 정보(이메일) 조회
            Map<String, String> userInfo = naverApiService.getUserInfo(accessToken);
            String email = userInfo.get("email");

            log.info("네이버 이메일: {}", email);

            // 3. DB에서 이메일로 사용자 확인
            // User user = userRepository.findByEmail(email);
            // boolean userExists = (user != null);

            // 임시: 실제 구현 시 위 로직으로 확인
            boolean userExists = false; // DB에서 사용자 존재 여부 확인

            String frontendUrl;
            if (userExists) {
                // 사용자가 있으면 → 로그인 성공 (JWT 토큰 발급 후 전달)
                // String token = jwtTokenProvider.generateToken(user);
                String token = "your_jwt_token_here";
                frontendUrl = "http://localhost:5173/login?token=" + token;
            } else {
                // 사용자가 없으면 → 회원가입 페이지로 이동 (이메일 정보 전달)
                frontendUrl = "http://localhost:5173/login?email=" + email + "&from=naver";
            }

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl))
                    .build();

        } catch (Exception e) {
            log.error("네이버 로그인 처리 중 오류", e);
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "status", 500,
                            "message", "네이버 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(),
                            "data", null
                    ));
        }
    }
}
