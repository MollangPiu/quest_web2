package kr.soft.today.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class KakaoApiService {
    
    @Value("${kakao.client-id}")
    private String clientId;
    
    @Value("${kakao.client-secret}")
    private String clientSecret;
    
    @Value("${kakao.redirect-uri}")
    private String redirectUri;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 1단계: 인증 코드(code)를 액세스 토큰으로 교환
     * 
     * 카카오 API: POST https://kauth.kakao.com/oauth/token
     * Request Body:
     *   - grant_type: "authorization_code"
     *   - client_id: "카카오_앱_키"
     *   - client_secret: "카카오_앱_시크릿"
     *   - redirect_uri: "등록한_리다이렉트_URI"
     *   - code: "인증_코드"
     * 
     * Response:
     * {
     *   "access_token": "액세스_토큰",
     *   "token_type": "bearer",
     *   "refresh_token": "...",
     *   "expires_in": 21599,
     *   ...
     * }
     */
    public String getAccessToken(String code) {
        String url = "https://kauth.kakao.com/oauth/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            String accessToken = jsonNode.get("access_token").asText();
            log.info("카카오 액세스 토큰 받음: {}", accessToken);
            
            return accessToken;
        } catch (Exception e) {
            log.error("카카오 액세스 토큰 받기 실패", e);
            throw new RuntimeException("카카오 액세스 토큰 받기 실패", e);
        }
    }
    
    /**
     * 2단계: 액세스 토큰으로 사용자 정보 조회 (이메일 포함)
     * 
     * 카카오 API: POST https://kapi.kakao.com/v2/user/me
     * Headers:
     *   - Authorization: "Bearer {액세스_토큰}"
     *   - Content-Type: "application/x-www-form-urlencoded"
     * 
     * Request Body (선택사항):
     *   - property_keys: ["kakao_account.email"] (이메일 정보 명시적 요청)
     * 
     * Response:
     * {
     *   "id": 123456789,
     *   "kakao_account": {
     *     "email": "user@example.com",
     *     "email_needs_agreement": false,
     *     "has_email": true,
     *     "is_email_valid": true,
     *     "is_email_verified": true,
     *     ...
     *   },
     *   ...
     * }
     */
    public Map<String, String> getUserInfo(String accessToken) {
        String url = "https://kapi.kakao.com/v2/user/me";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        // 이메일 정보를 명시적으로 요청하기 위한 파라미터
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("property_keys", "[\"kakao_account.email\"]");
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            log.info("카카오 사용자 정보 응답: {}", jsonNode.toString());
            
            // 카카오 사용자 ID
            Long kakaoId = jsonNode.get("id").asLong();
            log.info("카카오 사용자 ID: {}", kakaoId);
            
            // 이메일 정보 추출
            String email = null;
            JsonNode kakaoAccount = jsonNode.get("kakao_account");
            
            if (kakaoAccount != null) {
                // 이메일 정보 확인
                if (kakaoAccount.get("has_email") != null && kakaoAccount.get("has_email").asBoolean()) {
                    if (kakaoAccount.get("email") != null) {
                        email = kakaoAccount.get("email").asText();
                        log.info("카카오 이메일 조회 성공: {}", email);
                    } else {
                        log.warn("카카오 계정에 이메일이 있지만 조회할 수 없습니다.");
                    }
                } else {
                    log.warn("카카오 계정에 이메일 정보가 없습니다.");
                }
            } else {
                log.warn("카카오 계정 정보가 없습니다.");
            }
            
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("카카오 이메일 정보를 가져올 수 없습니다.");
            }
            
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("email", email);
            userInfo.put("kakaoId", String.valueOf(kakaoId));
            
            return userInfo;
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 실패", e);
            throw new RuntimeException("카카오 사용자 정보 조회 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 전체 플로우: code → access_token → user_info
     */
    public Map<String, String> processKakaoLogin(String code) {
        // 1. code를 액세스 토큰으로 교환
        String accessToken = getAccessToken(code);
        
        // 2. 액세스 토큰으로 사용자 정보(이메일) 조회
        Map<String, String> userInfo = getUserInfo(accessToken);
        
        return userInfo;
    }
}

