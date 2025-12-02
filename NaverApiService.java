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
public class NaverApiService {
    
    @Value("${naver.client-id}")
    private String clientId;
    
    @Value("${naver.client-secret}")
    private String clientSecret;
    
    @Value("${naver.redirect-uri}")
    private String redirectUri;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 1단계: 인증 코드(code)를 액세스 토큰으로 교환
     * 
     * 네이버 API: GET https://nid.naver.com/oauth2.0/token
     * Query Parameters:
     *   - grant_type: "authorization_code"
     *   - client_id: "네이버_클라이언트_ID"
     *   - client_secret: "네이버_클라이언트_시크릿"
     *   - redirect_uri: "등록한_리다이렉트_URI"
     *   - code: "인증_코드"
     *   - state: "상태값" (CSRF 방지용)
     * 
     * Response:
     * {
     *   "access_token": "액세스_토큰",
     *   "refresh_token": "...",
     *   "token_type": "bearer",
     *   "expires_in": 3600,
     *   ...
     * }
     */
    public String getAccessToken(String code, String state) {
        String url = "https://nid.naver.com/oauth2.0/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("state", state);
        
        // GET 요청이지만 파라미터를 쿼리 스트링으로 만들어야 함
        // URL 인코딩 필요
        StringBuilder urlBuilder = new StringBuilder(url);
        try {
            urlBuilder.append("?grant_type=authorization_code");
            urlBuilder.append("&client_id=").append(java.net.URLEncoder.encode(clientId, "UTF-8"));
            urlBuilder.append("&client_secret=").append(java.net.URLEncoder.encode(clientSecret, "UTF-8"));
            urlBuilder.append("&redirect_uri=").append(java.net.URLEncoder.encode(redirectUri, "UTF-8"));
            urlBuilder.append("&code=").append(java.net.URLEncoder.encode(code, "UTF-8"));
            urlBuilder.append("&state=").append(java.net.URLEncoder.encode(state, "UTF-8"));
        } catch (java.io.UnsupportedEncodingException e) {
            log.error("URL 인코딩 실패", e);
            throw new RuntimeException("URL 인코딩 실패", e);
        }
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                urlBuilder.toString(), 
                HttpMethod.GET, 
                request, 
                String.class
            );
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            // 에러 체크
            if (jsonNode.has("error")) {
                String error = jsonNode.get("error").asText();
                String errorDescription = jsonNode.has("error_description") 
                    ? jsonNode.get("error_description").asText() 
                    : "알 수 없는 오류";
                log.error("네이버 액세스 토큰 받기 실패: {} - {}", error, errorDescription);
                throw new RuntimeException("네이버 액세스 토큰 받기 실패: " + errorDescription);
            }
            
            String accessToken = jsonNode.get("access_token").asText();
            log.info("네이버 액세스 토큰 받음: {}", accessToken);
            
            return accessToken;
        } catch (Exception e) {
            log.error("네이버 액세스 토큰 받기 실패", e);
            throw new RuntimeException("네이버 액세스 토큰 받기 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 2단계: 액세스 토큰으로 사용자 정보 조회 (이메일 포함)
     * 
     * 네이버 API: GET https://openapi.naver.com/v1/nid/me
     * Headers:
     *   - Authorization: "Bearer {액세스_토큰}"
     * 
     * Response:
     * {
     *   "resultcode": "00",
     *   "message": "success",
     *   "response": {
     *     "id": "네이버_고유_ID",
     *     "email": "user@example.com",
     *     "name": "사용자명",
     *     "nickname": "닉네임",
     *     ...
     *   }
     * }
     */
    public Map<String, String> getUserInfo(String accessToken) {
        String url = "https://openapi.naver.com/v1/nid/me";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                request, 
                String.class
            );
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            log.info("네이버 사용자 정보 응답: {}", jsonNode.toString());
            
            // 에러 체크
            String resultcode = jsonNode.get("resultcode").asText();
            if (!"00".equals(resultcode)) {
                String message = jsonNode.has("message") 
                    ? jsonNode.get("message").asText() 
                    : "알 수 없는 오류";
                log.error("네이버 사용자 정보 조회 실패: {} - {}", resultcode, message);
                throw new RuntimeException("네이버 사용자 정보 조회 실패: " + message);
            }
            
            JsonNode responseNode = jsonNode.get("response");
            if (responseNode == null) {
                throw new RuntimeException("네이버 사용자 정보 응답이 올바르지 않습니다.");
            }
            
            // 네이버 사용자 ID
            String naverId = responseNode.get("id").asText();
            log.info("네이버 사용자 ID: {}", naverId);
            
            // 이메일 정보 추출
            String email = null;
            if (responseNode.has("email") && responseNode.get("email") != null) {
                email = responseNode.get("email").asText();
                log.info("네이버 이메일 조회 성공: {}", email);
            } else {
                log.warn("네이버 계정에 이메일 정보가 없습니다.");
            }
            
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("네이버 이메일 정보를 가져올 수 없습니다.");
            }
            
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("email", email);
            userInfo.put("naverId", naverId);
            
            // 추가 정보가 있으면 포함
            if (responseNode.has("name")) {
                userInfo.put("name", responseNode.get("name").asText());
            }
            if (responseNode.has("nickname")) {
                userInfo.put("nickname", responseNode.get("nickname").asText());
            }
            
            return userInfo;
        } catch (Exception e) {
            log.error("네이버 사용자 정보 조회 실패", e);
            throw new RuntimeException("네이버 사용자 정보 조회 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 전체 플로우: code → access_token → user_info
     */
    public Map<String, String> processNaverLogin(String code, String state) {
        // 1. code를 액세스 토큰으로 교환
        String accessToken = getAccessToken(code, state);
        
        // 2. 액세스 토큰으로 사용자 정보(이메일) 조회
        Map<String, String> userInfo = getUserInfo(accessToken);
        
        return userInfo;
    }
}

