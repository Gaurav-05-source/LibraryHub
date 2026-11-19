
package com.libraryhub.libraryhub.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.libraryhub.libraryhub.service.CustomUserDetailsService;
import com.libraryhub.libraryhub.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("========== JWT FILTER ==========");

        final String authHeader = request.getHeader("Authorization");

        System.out.println("JWT FILTER EXECUTED");
        System.out.println("AUTH HEADER PRESENT: " + (authHeader != null));

        // Check Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("NO BEARER TOKEN FOUND");

            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT
        final String jwt = authHeader.substring(7);
        final String email;

        try {

            email = jwtService.extractEmail(jwt);

            System.out.println("EMAIL FROM TOKEN: " + email);

        } catch (RuntimeException exception) {

            System.out.println("INVALID OR EXPIRED JWT TOKEN");

            filterChain.doFilter(request, response);
            return;
        }

        // Check whether authentication already exists
        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            try {

                // Load user from database
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                // Validate token
                boolean valid = jwtService.isTokenValid(
                        jwt, userDetails.getUsername());

                System.out.println("TOKEN VALID: " + valid);

                if (valid) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    // Set authentication in Security Context
                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);

                    System.out.println("USER AUTHENTICATED SUCCESSFULLY");
                    System.out.println("USER EMAIL: " + email);

                } else {

                    System.out.println("JWT VALIDATION FAILED");
                }

            } catch (UsernameNotFoundException exception) {

                System.out.println("USER NOT FOUND: " + email);

            } catch (RuntimeException exception) {

                System.out.println("JWT AUTHENTICATION ERROR: "
                        + exception.getClass().getSimpleName());
            }
        }

        System.out.println("========== JWT FILTER END ==========");

        filterChain.doFilter(request, response);
    }
}
