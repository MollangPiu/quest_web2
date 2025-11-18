package kr.soft.today.api;

import kr.soft.today.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/kakao")
public class KakaoController {

    // TODO: KakaoAuthService 주입
    // private final KakaoAuthService kakaoAuthService;

    @PostMapping("/key")
    public ResponseEntity<ApiResponse<String>> kakao() {
        return ApiResponse.success("d303c87e51bef9b2c77ca152cd3e1a23");
    }

    @GetMapping("/callback")
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

            // TODO: KakaoApiService를 사용하여 로그인 처리
            // 1. code를 액세스 토큰으로 교환
            // String accessToken = kakaoApiService.getAccessToken(code);
            
            // 2. 액세스 토큰으로 사용자 정보(이메일) 조회
            // Map<String, String> userInfo = kakaoApiService.getUserInfo(accessToken);
            // String email = userInfo.get("email");
            
            // 3. DB에서 이메일로 사용자 확인
            // User user = userRepository.findByEmail(email);
            // boolean userExists = (user != null);
            
            // 임시: 실제 구현 시 위 로직으로 확인
            boolean userExists = false; // DB에서 사용자 존재 여부 확인
            String email = "user@example.com"; // 카카오에서 받은 이메일
            
            String frontendUrl;
            if (userExists) {
                // 사용자가 있으면 → 로그인 성공 (JWT 토큰 발급 후 전달)
                // String token = jwtTokenProvider.generateToken(user);
                String token = "your_jwt_token_here";
                frontendUrl = "http://localhost:5173/login?token=" + token;
            } else {
                // 사용자가 없으면 → 회원가입 페이지로 이동 (이메일 정보 전달)
                frontendUrl = "http://localhost:5173/signup?email=" + email + "&from=kakao";
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

}
