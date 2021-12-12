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

    @Column(unique = true)
    private String username;

    private String password;

    private String salt;
}
