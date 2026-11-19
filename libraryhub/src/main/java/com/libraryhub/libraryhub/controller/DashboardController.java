
package com.libraryhub.libraryhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.libraryhub.libraryhub.dto.MemberDashboardDTO;
import com.libraryhub.libraryhub.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/member")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<MemberDashboardDTO> getMemberDashboard(
            Authentication authentication) {

        String email = authentication.getName();

        MemberDashboardDTO dashboard =
                dashboardService.getMemberDashboard(email);

        return ResponseEntity.ok(dashboard);
    }
}
