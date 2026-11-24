# Rollback for 1.30

`OutAndBack-121.apk` is version 1.29 (without the star map) with a higher version number (1.29.1, code 121), so it installs over 1.30.

To roll everyone back: copy `rollback.json` over `dist/latest.json` (and `OutAndBack-121.apk` over `dist/OutAndBack.apk`). Phones see the update within 12 hours.
To roll back only your own phone: download `OutAndBack-121.apk` and install it.
