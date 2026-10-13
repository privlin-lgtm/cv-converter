# Review instructions

Tag every finding with its pass and a severity: Important or Nit.

## Passes
- Bugs: logic errors, edge cases, regressions, money math (decimal only, rounding, currency).
- Security: no CV text stored, logged or persisted in the browser, input validation,
  secrets reachable from client code, PII in logs, payment webhooks verifying signatures.
- Chain compliance: the diff matches spec.md and plan.md where they exist; flag anything built that neither mentions.
- Fixed rules: no placeholders or stubbed handlers, no speculative tables or columns, no Stripe,
  AI decisions below the confidence threshold shown as "unsure", never as verdicts.

## Severity
Important = breaks behaviour, leaks data, or breaks a fixed rule or regulatory red line.
Everything else is a Nit.

## Limits
At most five nits; summarise the rest as a count.
Skip generated files and anything lint or CI already enforces.
