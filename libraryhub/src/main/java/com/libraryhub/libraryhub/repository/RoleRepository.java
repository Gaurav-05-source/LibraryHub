package com.libraryhub.libraryhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.libraryhub.libraryhub.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByRoleName(String roleName);

}