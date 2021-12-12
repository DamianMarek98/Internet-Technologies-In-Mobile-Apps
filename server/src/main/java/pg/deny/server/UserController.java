package pg.deny.server;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        boolean result = userService.loginUser(loginDto);
        return new ResponseEntity<>(result, result ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
    }

    @GetMapping(value = "/salt/{username}")
    public ResponseEntity<String> getUserSalt(@PathVariable String username) {
        User user = userService.findUser(username);
        return user == null ? new ResponseEntity<>(HttpStatus.NOT_FOUND) : new ResponseEntity<>(user.getSalt(), HttpStatus.OK);
    }
}
