package com.sudokulegend.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.net.Uri;
import android.content.Intent;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;
import java.io.InputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private String pendingOAuthCallback;
    public class AndroidBridge {
        @JavascriptInterface public void openBrowser(String url) {
            try {
                Uri uri=Uri.parse(url);
                if (!"https".equals(uri.getScheme()) || !"qpdlxmtjdcxonjekqkub.supabase.co".equals(uri.getHost()) || !uri.getPath().startsWith("/auth/v1/authorize")) return;
                runOnUiThread(() -> startActivity(new Intent(Intent.ACTION_VIEW,uri)));
            } catch (Exception ignored) {}
        }
    }
    private void receiveOAuth(Intent intent) {
        if(intent==null || intent.getData()==null) return;
        Uri uri=intent.getData();
        if(!"sudokulegend".equals(uri.getScheme()) || !"auth".equals(uri.getHost()) || !"/callback".equals(uri.getPath())) return;
        pendingOAuthCallback=uri.toString();
        if(webView!=null) deliverOAuth();
    }
    private void deliverOAuth() {
        if(pendingOAuthCallback==null || webView==null)return;
        String js="if(window.sudokuGoogleOAuthReturn){window.sudokuGoogleOAuthReturn("+JSONObject.quote(pendingOAuthCallback)+");true}else{false}";
        webView.evaluateJavascript(js, result -> {if("true".equals(result))pendingOAuthCallback=null;});
    }
    @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);receiveOAuth(intent);}
    @Override protected void onResume(){super.onResume();if(webView!=null)webView.postDelayed(this::deliverOAuth,500);}

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        webView.addJavascriptInterface(new AndroidBridge(),"SudokuAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost()) && "/assets/index.html".equals(uri.getPath())) {
                    try { InputStream in=getAssets().open("index.html"); return new WebResourceResponse("text/html","UTF-8",in); }
                    catch (Exception ignored) { return null; }
                }
                return null; // Allow normal HTTPS requests, including Supabase SDK and API
            }
        });
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        receiveOAuth(getIntent());
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() { if (webView!=null) webView.destroy(); super.onDestroy(); }
}
