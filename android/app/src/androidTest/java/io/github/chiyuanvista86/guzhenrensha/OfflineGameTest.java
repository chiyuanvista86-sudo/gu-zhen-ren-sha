package io.github.chiyuanvista86.guzhenrensha;

import android.content.pm.ActivityInfo;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class OfflineGameTest {
    private String evaluate(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        scenario.onActivity(activity -> ((WebView) activity.findViewById(R.id.game_webview))
            .evaluateJavascript(script, value -> { result.set(value); done.countDown(); }));
        assertTrue("JavaScript callback timed out: " + script, done.await(30, TimeUnit.SECONDS));
        return result.get();
    }
    private void await(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(30);
        while (System.nanoTime() < deadline) {
            if ("true".equals(evaluate(scenario, script))) return;
            Thread.sleep(200);
        }
        fail("Offline game condition failed: " + script);
    }
    @Test public void offlineGameStartsRotatesAndRestoresSave() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            await(scenario, "!!document.querySelector('.c-start-row button')");
            assertEquals("true", evaluate(scenario, "typeof GuAndroid.exportFile === 'function'"));
            assertEquals("true", evaluate(scenario, "document.documentElement.scrollWidth <= innerWidth + 1"));
            evaluate(scenario, "document.querySelector('.c-start-row button').click()");
            await(scenario, "!!document.querySelector('.c-arena') && !!localStorage.getItem('gu-zhen-ren-sha:cultivation:v3:game')");
            await(scenario, "Array.from(document.images).every(img => img.complete && img.naturalWidth > 0 && img.src.startsWith('data:'))");
            evaluate(scenario, "document.querySelector('.c-arena-top button').click()");
            evaluate(scenario, "window.beforeCardSelection = localStorage.getItem('gu-zhen-ren-sha:cultivation:v3:game'); document.querySelector('.c-hand-row [data-card-kind=life]').click()");
            await(scenario, "!!document.querySelector('.c-clear-selection')");
            assertEquals("true", evaluate(scenario, "window.beforeCardSelection === localStorage.getItem('gu-zhen-ren-sha:cultivation:v3:game')"));
            evaluate(scenario, "document.querySelector('.c-clear-selection').click(); document.querySelector('.c-mobile-tools button').click()");
            await(scenario, "!!document.querySelector('.c-toolbox.open')");
            evaluate(scenario, "document.querySelector('.c-panel-close').click()");
            evaluate(scenario, "window.rotationProbe = 42");
            scenario.onActivity(activity -> activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE));
            await(scenario, "innerWidth > innerHeight");
            assertEquals("42", evaluate(scenario, "window.rotationProbe"));
            assertEquals("true", evaluate(scenario, "document.documentElement.scrollWidth <= innerWidth + 1"));
            scenario.recreate();
            await(scenario, "!!document.querySelector('.c-arena')");
            assertEquals("true", evaluate(scenario, "JSON.parse(localStorage.getItem('gu-zhen-ren-sha:cultivation:v3:game')).players.length === 2"));
            assertEquals("true", evaluate(scenario, "!document.querySelector('.mode-switch') && document.title.includes('蛊道争仙')"));
            assertEquals("true", evaluate(scenario, "JSON.parse(localStorage.getItem('gu-zhen-ren-sha:cultivation:v3:game')).version === 3"));
        }
    }
}
