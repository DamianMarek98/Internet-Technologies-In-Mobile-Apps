package pg.deny.server;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "tiwam_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String password;

    private String salt;
}
