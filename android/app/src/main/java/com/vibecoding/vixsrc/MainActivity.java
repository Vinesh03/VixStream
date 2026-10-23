package com.vibecoding.vixsrc;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                CookieManager cm = CookieManager.getInstance();
                cm.setAcceptCookie(true);
                cm.setAcceptThirdPartyCookies(webView, true);

                WebSettings ws = webView.getSettings();
                ws.setMediaPlaybackRequiresUserGesture(false);
                String ua = ws.getUserAgentString();
                if (ua != null && ua.contains("; wv")) {
                    ws.setUserAgentString(ua.replace("; wv", ""));
                }
            }
        } catch (Exception ignored) {}
    }
}
