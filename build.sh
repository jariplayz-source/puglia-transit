#!/bin/sh
# Builds app/ into OutAndBack.apk.
# Needs: javac (JDK 8+), Android build-tools (aapt, d8 or dx, zipalign, apksigner) and android.jar (API 34).
#   ANDROID_JAR=/path/to/android.jar KEYSTORE=key.jks KEY_ALIAS=pt KEY_PASS=... ./build.sh
set -e
cd "$(dirname "$0")/app"
: "${ANDROID_JAR:?set ANDROID_JAR to android-34 android.jar}"
rm -rf ../build && mkdir -p ../build/obj
javac -source 8 -target 8 -nowarn -cp "$ANDROID_JAR" -d ../build/obj $(find src -name '*.java')
if command -v d8 >/dev/null; then d8 --output ../build $(find ../build/obj -name '*.class') --lib "$ANDROID_JAR"; else dx --dex --output=../build/classes.dex ../build/obj; fi
aapt package -f -M AndroidManifest.xml -S res -A assets -I "$ANDROID_JAR" -F ../build/unsigned.apk
(cd ../build && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f 4 ../build/unsigned.apk ../build/aligned.apk
apksigner sign --ks "${KEYSTORE:?set KEYSTORE}" --ks-key-alias "${KEY_ALIAS:-pt}" --ks-pass "pass:${KEY_PASS:?set KEY_PASS}" --out ../OutAndBack.apk ../build/aligned.apk
echo "Built OutAndBack.apk"
