package pg.deny.server;

import lombok.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class CacheService {

    private final Map<String, ResponseEntity<?>> restCache  = new HashMap<>();

    public void cacheResponse(String uri, ResponseEntity<?> response) {
        restCache.put(uri, response);
    }

    @SuppressWarnings("unchecked")
    public <T> Optional<ResponseEntity<T>> findResponseInCache(@NonNull String uri) {
        var res = restCache.get(uri);
        return (res == null) ? Optional.empty() : Optional.of((ResponseEntity<T>) res);
    }
}
