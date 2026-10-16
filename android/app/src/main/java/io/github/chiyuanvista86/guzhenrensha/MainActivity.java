package io.github.chiyuanvista86.guzhenrensha;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final int SAVE_DOCUMENT = 40;
    private static final String GAME_URL = "https://appassets.androidplatform.net/assets/index.html";
    private WebView webView;
    private String pendingExport;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(16, 29, 34));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        webView = new WebView(this);
        webView.setId(R.id.game_webview);
        webView.setBackgroundColor(Color.rgb(16, 29, 34));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse asset = loader.shouldInterceptRequest(request.getUrl());
                return asset != null ? asset : new WebResourceResponse("text/plain", "UTF-8", 403,
                    "Offline app", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !GAME_URL.equals(request.getUrl().toString());
            }
        });
        webView.addJavascriptInterface(new DocumentBridge(), "GuAndroid");
        if (state != null) pendingExport = state.getString("pendingExport");
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        root.requestApplyInsets();
        webView.loadUrl(GAME_URL);
    }

    private final class DocumentBridge {
        @JavascriptInterface public void exportFile(String name, String text, String mime) {
            if (text == null || text.length() > 2_000_000) return;
            String filename = name == null ? "蛊真人杀.txt" : name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_");
            String type = "application/json".equals(mime) ? "application/json" : "text/markdown";
            runOnUiThread(() -> {
                if (pendingExport != null) return;
                pendingExport = text;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType(type);
                intent.putExtra(Intent.EXTRA_TITLE, filename);
                try { startActivityForResult(intent, SAVE_DOCUMENT); }
                catch (android.content.ActivityNotFoundException error) {
                    pendingExport = null;
                    Toast.makeText(MainActivity.this, "此设备没有可用的文件保存应用", Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != SAVE_DOCUMENT) return;
        String text = pendingExport;
        pendingExport = null;
        Uri uri = data == null ? null : data.getData();
        if (result != RESULT_OK || uri == null || text == null) return;
        try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
            if (output == null) throw new IOException("No output stream");
            output.write(text.getBytes(StandardCharsets.UTF_8));
            Toast.makeText(this, "文件已保存", Toast.LENGTH_SHORT).show();
        } catch (IOException error) {
            Toast.makeText(this, "保存失败，请重新选择位置", Toast.LENGTH_LONG).show();
        }
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        if (pendingExport != null && pendingExport.length() < 200_000) state.putString("pendingExport", pendingExport);
    }
    @Override protected void onPause() {
        webView.onPause();
        webView.pauseTimers();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        webView.onResume();
        webView.resumeTimers();
    }
    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setTitle("退出蛊真人杀？")
            .setMessage("对局会自动保存在当前设备，下次打开可继续。")
            .setNegativeButton("继续游玩", null).setPositiveButton("退出", (dialog, which) -> finish()).show();
    }
    @Override protected void onDestroy() {
        webView.removeJavascriptInterface("GuAndroid");
        webView.destroy();
        super.onDestroy();
    }
}
