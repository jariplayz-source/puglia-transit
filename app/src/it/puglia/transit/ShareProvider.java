package it.puglia.transit;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Lets other apps (WhatsApp, mail…) read a file you chose to share, e.g. your trip summary. Only files in the app's share folder. */
public class ShareProvider extends ContentProvider {
    static final String AUTH = "it.puglia.transit.share";
    File dir() { return new File(getContext().getCacheDir(), "share"); }
    @Override public boolean onCreate() { return true; }
    File file(Uri u) throws FileNotFoundException {
        String n = u.getLastPathSegment();
        if (n == null || n.contains("/") || n.contains("..")) throw new FileNotFoundException();
        File f = new File(dir(), n); if (!f.exists()) throw new FileNotFoundException(); return f;
    }
    @Override public ParcelFileDescriptor openFile(Uri u, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(file(u), ParcelFileDescriptor.MODE_READ_ONLY);
    }
    @Override public String getType(Uri u) {
        String n = u.getLastPathSegment() == null ? "" : u.getLastPathSegment();
        return n.endsWith(".html") ? "text/html" : n.endsWith(".jpg") ? "image/jpeg" : n.endsWith(".webm") ? "audio/webm" : "application/octet-stream";
    }
    @Override public Cursor query(Uri u, String[] proj, String sel, String[] args, String sort) {
        try { File f = file(u); MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
            c.addRow(new Object[]{f.getName(), f.length()}); return c; } catch (Exception e) { return null; }
    }
    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
