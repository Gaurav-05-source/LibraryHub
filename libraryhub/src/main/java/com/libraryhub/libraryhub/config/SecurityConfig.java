
package com.libraryhub.libraryhub.config;

import org.springframework.context.annotation.Bean;
import java.util.List;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.libraryhub.libraryhub.security.JwtAuthenticationFilter;
import com.libraryhub.libraryhub.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers("/api/users/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()

                // Public book browsing
                .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()

                // Logged-in users can access their own profile
                .requestMatchers("/api/users/me/**").authenticated()

                // Admin-only book management
                .requestMatchers("/api/books/**").hasRole("ADMIN")

                // Admin-only user management
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Admin-only category management
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                .requestMatchers("/api/categories/**").hasRole("ADMIN")

                // Admin-only physical book copy management
                .requestMatchers("/api/book-copies/**").hasRole("ADMIN")

                // Admin and Member reservation access
                .requestMatchers("/api/reservations/**")
                    .hasAnyRole("ADMIN", "MEMBER")

                // Admin and Member can view borrowing records
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/borrow-records",
                    "/api/borrow-records/**"
                ).hasAnyRole("ADMIN", "MEMBER")

                // Only Admin can issue and manage borrowing records
                .requestMatchers("/api/borrow-records/**")
                    .hasRole("ADMIN")

                // Admin and Member can view fines
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/fines",
                    "/api/fines/**"
                ).hasAnyRole("ADMIN", "MEMBER")

                // Only Admin can generate, pay or waive fines
                .requestMatchers("/api/fines/**").hasRole("ADMIN")

                // All remaining endpoints require authentication
                .anyRequest().authenticated()
            )

            .authenticationProvider(authenticationProvider())

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
