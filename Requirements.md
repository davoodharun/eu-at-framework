I want to build a integrationa and end to end testing framework for a client. The client maintains 6 sites (operating companies (opco)). Each of these sites visually look the same  but have some differences:

### production
- bge.com
- comed.com
- peco.com
- atanticcityelectric.com
- delmarva.com
- pepco.com

### stage
- azstage.bge.com
- azstage.comed.com
- azstage.peco.com
- azstage.atanticcityelectric.com
- azstage.delmarva.com
- azstage.pepco.com

1. Tests should be written using playwright
2. Tests should be grouped into e2e tests (for testing ui components and flows that utliize backend calls), and integration tests (primary focused on middleware and backend apps, tests integration and connectivity)
3. Within e2e and integration test grouping, tests should be grouped into categories (i.e. login, outages, payments etc)
4. Focus on the framework being built and not so much the tests themselves (they can be minimal)
5. All tests should have the ability to be tagged an annotated (should be able to run the tests for test categories i.e all e2e tests, only integration tests, only login tests etc)
5. Tests should be dynamic such that it each test can be run on a distinct environment (i.e stage or prod), in addition to being able to run  for one or many sites (opcos) in parallel
6. Most test cases will utilize a username/password that will be distinct to a given opco AND a specific tests case; for example, a different set of credentials might be used to test basic login flow on bge.com, but a different set of credentials could be used to test the outage flow on bge.com. Credentials will also differ across opcos and environments. This is also applicable to non-credential based test data.
7. Come up with a secure, sensical way to store credentials and utlize them in the tests


Please refer back to this document.

Please ensure all builds are passing.

Please document your work in README.md