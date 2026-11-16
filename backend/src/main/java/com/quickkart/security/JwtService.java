
package com.quickkart.security;

import com.quickkart.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    // Generate signing key
    private SecretKey getSigningKey() {

        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate JWT token
    public String generateToken(User user) {

        Date issuedAt = new Date();
        Date expiration = new Date(
                issuedAt.getTime() + jwtExpiration
        );

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    // Extract email from token
    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();
    }

    // Extract role from token
    public String extractRole(String token) {

        return extractAllClaims(token).get("role", String.class);
    }

    // Extract all claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate JWT token
    public boolean isTokenValid(String token, User user) {

        try {

            Claims claims = extractAllClaims(token);

            String username = claims.getSubject();

            return username.equals(user.getEmail())
                    && claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException exception) {

            return false;
        }
    }
}
