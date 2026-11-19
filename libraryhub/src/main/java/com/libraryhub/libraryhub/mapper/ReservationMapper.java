
package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.ReservationResponseDTO;
import com.libraryhub.libraryhub.entity.Reservation;

public class ReservationMapper {

    public static ReservationResponseDTO toDTO(
            Reservation reservation) {

        ReservationResponseDTO dto = new ReservationResponseDTO();

        dto.setReservationId(reservation.getReservationId());
        dto.setReservationDate(reservation.getReservationDate());
        dto.setExpiryDate(reservation.getExpiryDate());
        dto.setStatus(reservation.getStatus());

        if (reservation.getUser() != null) {
            dto.setUserId(reservation.getUser().getUserId());
            dto.setUserName(reservation.getUser().getName());
        }

        if (reservation.getBook() != null) {
            dto.setBookId(reservation.getBook().getBookId());
            dto.setBookTitle(reservation.getBook().getTitle());
        }

        if (reservation.getAssignedCopy() != null) {
            dto.setAssignedCopyId(
                    reservation.getAssignedCopy().getCopyId());

            dto.setAssignedCopyBarcode(
                    reservation.getAssignedCopy().getBarcode());
        }

        return dto;
    }
}
