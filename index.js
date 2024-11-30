import puppeteer from 'puppeteer-core';
import { CreateProfile, startBrowser } from './utils/functions.js';

let input = [
    {
        keyword: "Neckless",
        location: "New York",
        personalization: "RED",
        listing_url: "https://www.etsy.com/listing/851979574/attached-diamond-on-chain-14kt-gold?click_key=03ec415e4d36914ea03990f019dc5a0e9db54bb6%3A851979574&click_sum=02498447&ref=search2_top_narrowing_intent_modules_etsys_pick-1&pro=1&frs=1&sts=1"
    },
    {
        keyword: "Neckless",
        location: "New York",
        personalization: "RED",
        listing_url: "https://www.etsy.com/listing/851979574/attached-diamond-on-chain-14kt-gold?click_key=03ec415e4d36914ea03990f019dc5a0e9db54bb6%3A851979574&click_sum=02498447&ref=search2_top_narrowing_intent_modules_etsys_pick-1&pro=1&frs=1&sts=1"
    },
    {
        keyword: "Neckless",
        location: "New York",
        personalization: "RED",
        listing_url: "https://www.etsy.com/listing/851979574/attached-diamond-on-chain-14kt-gold?click_key=03ec415e4d36914ea03990f019dc5a0e9db54bb6%3A851979574&click_sum=02498447&ref=search2_top_narrowing_intent_modules_etsys_pick-1&pro=1&frs=1&sts=1"
    },
    {
        keyword: "Neckless",
        location: "New York",
        personalization: "RED",
        listing_url: "https://www.etsy.com/listing/851979574/attached-diamond-on-chain-14kt-gold?click_key=03ec415e4d36914ea03990f019dc5a0e9db54bb6%3A851979574&click_sum=02498447&ref=search2_top_narrowing_intent_modules_etsys_pick-1&pro=1&frs=1&sts=1"
    },
    {
        keyword: "Neckless",
        location: "New York",
        personalization: "RED",
        listing_url: "https://www.etsy.com/listing/851979574/attached-diamond-on-chain-14kt-gold?click_key=03ec415e4d36914ea03990f019dc5a0e9db54bb6%3A851979574&click_sum=02498447&ref=search2_top_narrowing_intent_modules_etsys_pick-1&pro=1&frs=1&sts=1"
    }
],
    LAST_STEP_LISTING_URL = 'https://www.etsy.com/featured/home-design-and-organization?ref=market_guides_carousel_2';

(async () => {
    
    let PROFILE_ID = await CreateProfile({
        name: "My Profile",
        group_id: 5346181
    });

    let ws = await startBrowser(PROFILE_ID),
        browser = await puppeteer.connect({
            headless: false,
            browserWSEndpoint: ws
        }),
        page = await browser.newPage();

    await page.goto("https://etsy.com", { waitUntil: "networkidle0", timeout: 0 });

    await page.type("#global-enhancements-search-query", keyword, { delay: 100 }); // Type Keyword
    await page.keyboard.press("Enter");

    await page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 0
    });

})();