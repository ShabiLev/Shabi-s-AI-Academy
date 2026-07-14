# Admin foundation

Admin routes are lazy, authenticated, and guarded by verified role data returned from a protected role table or trusted JWT claim. Email strings, localStorage, route obscurity, and component state never grant access. Version 1.3 exposes a read-only foundation and honest unavailable states; no browser service-role operation exists.

## Acceptance

Guest and standard users receive an inaccessible response, while tests can inject a verified admin claim through the auth boundary only.

Administrative writes and user deletion remain outside the browser-only Version 1.3 scope.
