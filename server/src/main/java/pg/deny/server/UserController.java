package pg.deny.server;

import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return new ResponseEntity<>("Abcd", HttpStatus.OK);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> login(@RequestBody LoginDto loginDto) {
        var result = userService.loginUser(loginDto);
        return new ResponseEntity<>(result, result ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
    }

    @GetMapping(value = "/salt/{username}")
    public ResponseEntity<String> getUserSalt(@PathVariable String username) {
        var user = userService.findUser(username);
        return new ResponseEntity<>(user == null ? Strings.EMPTY : user.getSalt(), HttpStatus.OK);
    }

    @GetMapping(value = "/cache-test")
    public ResponseEntity<List<String>> getUserSalt() {
        return new ResponseEntity<>(List.of("to", "powinno", "zostać", "umieszczone", "w", "pamięci", "cache"), HttpStatus.OK);
    }
}
