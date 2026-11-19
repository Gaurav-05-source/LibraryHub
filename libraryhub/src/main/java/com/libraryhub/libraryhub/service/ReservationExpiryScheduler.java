
package com.libraryhub.libraryhub.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservationExpiryScheduler {

    private final ReservationQueueService reservationQueueService;

    public ReservationExpiryScheduler(
            ReservationQueueService reservationQueueService) {

        this.reservationQueueService = reservationQueueService;
    }

    // Check for expired reservations every 60 seconds
    @Scheduled(fixedDelay = 60000)
    public void checkExpiredReservations() {

        reservationQueueService.expireReservations();
    }
}
