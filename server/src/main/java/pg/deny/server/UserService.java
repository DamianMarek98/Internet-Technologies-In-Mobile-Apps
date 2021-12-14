package pg.deny.server;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.SecureRandom;
import java.util.Base64;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @PostConstruct
    private void initializeUser() {
        var user = new User();
        user.setUsername("test");
        user.setPassword(hashText("12345"));
        user.setSalt(generateSalt());
        saveUser(user);

        var user2 = new User();
        user2.setUsername("admin");
        user2.setPassword(hashText("admin"));
        user2.setSalt(generateSalt());
        saveUser(user);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public User findUser(String username) {
        return userRepository.findByUsername(username);
    }

    public String generateSalt() {
        var random = new SecureRandom();
        var saltArr = new byte[16];
        random.nextBytes(saltArr);
        var encoder = Base64.getUrlEncoder().withoutPadding();
        return encoder.encodeToString(saltArr);
    }

    private String hashText(String text) {
        return DigestUtils.sha1Hex(text);
    }

    public boolean loginUser(LoginDto loginDto) {
        var user = findUser(loginDto.getUsername());
        return user != null && hashText(loginDto.getPassword()).equals(hashText(hashText(user.getPassword() + user.getSalt())));
    }
}
