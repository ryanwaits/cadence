---
"@waits/cadence": patch
---

Align the result panel card's entrance with the code window so both cards animate in on the same frame. They previously used different default entrance delays (code window 12, panel card 30), so the panel slid in ~18 frames late. Both now default to a shared `CARD_ENTER` spec. The panel's *content* reveal (rows running as the code finishes typing) is unchanged.
