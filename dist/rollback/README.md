# Rollback for 1.31

`OutAndBack-123.apk` is version 1.30 (the first star map) with a higher version number (1.30.1, code 123), so it installs over 1.31.

To roll everyone back: copy `rollback.json` over `dist/latest.json` (and `OutAndBack-123.apk` over `dist/OutAndBack.apk`). Phones see the update within 12 hours.
To roll back only your own phone: download `OutAndBack-123.apk` and install it.
