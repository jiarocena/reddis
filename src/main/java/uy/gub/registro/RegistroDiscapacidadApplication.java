package uy.gub.registro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RegistroDiscapacidadApplication {

    public static void main(String[] args) {
        SpringApplication.run(RegistroDiscapacidadApplication.class, args);
    }
}
