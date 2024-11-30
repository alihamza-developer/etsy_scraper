import 'dotenv/config';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { between, CreateProfile, DeleteProfile, startBrowser, wait } from './utils/functions.js';

// Inputs 
const INPUTS = JSON.parse(fs.readFileSync("inputs.json", "utf-8")),
    SITE_URL = "https://etsy.com",
    PAGE_OPTIONS = {
        waitUntil: "networkidle0",
        timeout: 0
    };


(async () => {

    //#region (Creating Profile, Start Browser)
    // Create Profile
    let PROFILE_ID = await CreateProfile({
        name: process.env.PROFILE_NAME,
        group_id: process.env.GROUP_ID
    });

    // Start Browser
    let ws = await startBrowser(PROFILE_ID);

    if (!ws) {
        await DeleteProfile(PROFILE_ID);
        console.log("Please Try Again!");
        return false;
    }

    let browser = await puppeteer.connect({
        headless: false,
        browserWSEndpoint: ws
    });
    //#endregion (Creating Profile, Start Browser) 

    for (let i = 0; i < INPUTS.length; i++) {
        let { keyword, location, personalization, listing_url } = INPUTS[i],
            page = await browser.newPage();

        try {
            await page.goto(SITE_URL, PAGE_OPTIONS);
        } catch (error) {
            continue;
        }


        // (Type Keyword, Show listings)
        await page.type("#global-enhancements-search-query", keyword, { delay: 100 });
        await page.keyboard.press("Enter");
        await page.waitForNavigation({ timeout: 0 });


        //#region Filters
        await page.click("#search-filter-button");
        await wait(3000);
        await page.type("#shop-location-input", location, { delay: 500 });
        await wait(4000);

        let valid = await page.evaluate(() => {
            let listbox = document.querySelector('#shop-location-input').getAttribute('aria-controls'),
                listBoxCon = document.querySelector(`ul[id="${listbox}"]`);
            if (!listBoxCon.firstChild) return false
            listBoxCon.firstChild?.dispatchEvent(new Event("click"));
            return true;
        });
        if (!valid) {
            console.log("Location not found in filters so we will skip this listing");
            continue;
        }
        await wait(3000);
        await page.click(".search-filters-modal button[aria-label='Close']"); // Close Filters Sidebar
        //#endregion Filters 

    }

})();