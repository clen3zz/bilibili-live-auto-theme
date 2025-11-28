// ==UserScript==
// @name         Bilibili 直播间主题跟随系统 (专属最终版)
// @namespace    https://github.com/clen3zz/
// @version      1.0
// @description  解决 Bilibili 直播间页面无法自动跟随系统深色/浅色模式的问题。
// @author       clen3zz
// @match        https://live.bilibili.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/clen3zz/bilibili-live-theme-sync/main/bilibili-live-theme-sync.user.js
// @downloadURL  https://raw.githubusercontent.com/clen3zz/bilibili-live-theme-sync/main/bilibili-live-theme-sync.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 侦测系统当前的颜色模式
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    /**
     * Bilibili 直播的“精确两步点击”核心逻辑（无固定延时版本）
     * 1. 点击实验室按钮打开菜单
     * 2. 等待开关元素出现后立即点击深色模式开关
     * 3. 下一帧再点一次实验室按钮把菜单收起
     */
    function setupBiliLiveThemeSync() {
        const labButtonSelector = '.icon-lab';     // 实验室按钮
        const themeSwitchSelector = '.bl-switch';  // 所有开关的通用类名

        // 核心操作序列（保持原有判定与索引逻辑不变）
        const checkAndClickSequence = () => {
            const labButton = document.querySelector(labButtonSelector);
            if (!labButton) return;

            const isSystemDark = darkModeQuery.matches;
            const isPageDark = document.documentElement.getAttribute('lab-style')?.includes('dark');

            // 当系统与页面主题不一致时，执行自动化操作
            if (isSystemDark !== isPageDark) {
                // 步骤 1: 点击实验室按钮，打开菜单
                labButton.click();

                // 等待开关元素出现（不再用固定延时）
                waitForElement(themeSwitchSelector, () => {
                    const allSwitches = document.querySelectorAll(themeSwitchSelector);
                    // 确认开关数量足够，然后选中第二个 (索引为1) —— 保持原逻辑
                    if (allSwitches.length > 1) {
                        const darkModeSwitch = allSwitches[1];

                        // 步骤 2: 元素已出现，立即点击开关
                        darkModeSwitch.click();

                        // 步骤 3: 下一帧再收起菜单（无固定延时）
                        requestAnimationFrame(() => {
                            labButton.click();
                        });
                    }
                });
            }
        };

        // 工具函数：等待指定元素出现在页面上（保持原来的 callback 形态）
        const waitForElement = (selector, callback) => {
            let elements = document.querySelectorAll(selector);
            if (elements.length > 0) { callback(); return; }

            const observer = new MutationObserver(() => {
                elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    observer.disconnect();
                    callback();
                }
            });

            // 监视整个文档的动态变化
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                // 如果 body 还没加载，则等待页面加载完毕再开始监视
                window.addEventListener('load', () => observer.observe(document.body, { childList: true, subtree: true }), { once: true });
            }
        };

        // **执行时机**（保持不变）
        // 1. 页面加载完毕后，检查一次
        window.addEventListener('load', () => waitForElement(labButtonSelector, checkAndClickSequence));
        // 2. 当系统主题发生变化时，再检查一次
        darkModeQuery.addEventListener('change', () => waitForElement(labButtonSelector, checkAndClickSequence));
    }

    // 启动Bilibili直播间的专属逻辑
    setupBiliLiveThemeSync();

})();
