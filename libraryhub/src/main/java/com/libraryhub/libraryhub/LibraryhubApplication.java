package com.libraryhub.libraryhub;

import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class LibraryhubApplication {

	public static void main(String[] args) {
		SpringApplication.run(LibraryhubApplication.class, args);
	}

}
