import 'dotenv/config';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { wait, between, CloseBrowser, CreateProfile, DeleteProfile, StartBrowser, isExists, waitForProductsLoad } from './utils/functions.js';

// Inputs 
const INPUTS = JSON.parse(fs.readFileSync("inputs.json", "utf-8")),
    SITE_URL = "https://etsy.com",
    PAGE_OPTIONS = {
        waitUntil: "networkidle0",
        timeout: 0
    };

while (true) {


    //#region (Creating Profile, Start Browser)
    // Create Profile
    let PROFILE_ID = await CreateProfile({
        name: process.env.PROFILE_NAME,
        group_id: process.env.GROUP_ID
    });

    // Start Browser
    let ws = await StartBrowser(PROFILE_ID);

    if (!ws) {
        await DeleteProfile(PROFILE_ID);
        console.log("Please Try Again!");
        break;
    }

    let browser = await puppeteer.connect({
        headless: "new",
        protocolTimeout: 240000,
        browserWSEndpoint: ws
    });

    //#endregion (Creating Profile, Start Browser) 

    for (let i = 0; i < INPUTS.length; i++) {
        let { keyword, location, personalization, listing_url } = INPUTS[i],
            page = await browser.newPage();

        await page.goto(SITE_URL, PAGE_OPTIONS);

        // (Type Keyword, Show listings)
        await page.type("#global-enhancements-search-query", keyword, { delay: 100 });
        await page.keyboard.press("Enter");
        console.log("Start Waiting");
        await waitForProductsLoad();
        console.log("Listing");

        let urls = await page.evaluate(() => {
            let listings = Array.from(document.querySelectorAll('ul[data-results-grid-container] li')),
                urls = [];
            // Loop
            listings.forEach(listing => {
                let listingLink = listing.querySelector(".listing-link");
                urls.push(listingLink);
            });
            return urls;
        });
        console.log(urls);

        continue;

        //#region Filters
        await page.click("#search-filter-button");
        await wait(3000);
        await page.type("#shop-location-input", location, { delay: 500 });
        await wait(4000);

        let valid = await page.evaluate(() => {
            let listbox = document.querySelector('#shop-location-input').getAttribute('aria-controls'),
                listBoxCon = document.querySelector(`ul[id="${listbox}"]`);
            if (!listBoxCon.firstChild) return false
            listBoxCon.firstChild?.click();
            return true;
        });

        if (!valid) {
            console.log("Location not found in filters so we will skip this listing");
            continue;
        }
        await wait(3000);
        await page.click(".search-filters-modal button[aria-label='Close']"); // Close Filters Sidebar
        //#endregion Filters 

        //#region Finding Listing

        await page.evaluate(async (listing_url) => {
            //#region Functions
            // Wait
            const wait = (ms) => new Promise((res, rej) => setTimeout(res, ms));
            // Get Random Number Between
            function between(from, to) {
                return Math.floor(Math.random() * (to - from + 1)) + from;
            }
            //#endregion Functions 
            let founded = false;

            while (true) {
                let scroll = 0,
                    interval = setInterval(() => {
                        scroll += between(20, 150);
                        window.scrollTo(0, scroll);
                    }, 200);
                await wait(between(15, 30) * 1000);
                clearInterval(interval)

                let listings = document.querySelectorAll('ul[data-results-grid-container] li'),
                    paginationBtn = document.querySelector("[data-search-pagination] .wt-hide-lg .wt-action-group__item-container:last-child a:not([disabled])"),
                    abort = false,
                    foundedListing = null;

                listings = Array.from(listings);
                // Loop
                for (let i = 0; i < listings.length; i++) {
                    let listing = listings[i],
                        listingLink = listing.querySelector(".listing-link");

                    if (listingLink.href.includes(listing_url)) {
                        listingLink.target = "_self";
                        foundedListing = listingLink;
                        abort = true;
                        break;
                    }
                }

                // Abort
                if (abort) {
                    foundedListing.click();
                    founded = true;
                    break;
                }

                paginationBtn.click(); // Goto next page
            }
            return founded;
        }, listing_url);

        await page.waitForNavigation({ timeout: 0 });
        const url = await page.evaluate(() => document.location.href);
        if (!url.includes(listing_url)) {
            console.log("We are not on product page after finding so we will skip this");
            continue;
        }

        //#endregion Finding Listing 

        //#region Perform Steps

        // Images Step
        for (let i = 0; i < 5; i++) {
            try {
                await page.click("[data-carousel-nav-button][aria-label='Next image']");
                await wait(between(1, 5) * 1000);
            } catch (error) {
                break;
            }
        }
        // Reviews Step
        for (let i = 0; i < 5; i++) {
            try {
                await page.click("[aria-label='Pagination'] [data-reviews-pagination] .wt-action-group__item-container:last-child a");
                await wait(between(1, 5) * 1000);

            } catch (error) {
                break;
            }
        }


        //#region Add To Cart

        let dropdowns = await page.evaluate(() => {
            let sinputs = document.querySelectorAll('select[data-variation-number]'),
                dropdowns = {};
            sinputs.forEach((select, i) => {
                let options = select.querySelectorAll("option"),
                    targetOption = null;
                options.forEach(option => {
                    if (!option.hasAttribute("disabled") && option.value != "" && !targetOption)
                        targetOption = option;

                });
                dropdowns[`select[data-variation-number="${i}"]`] = targetOption.value;
            });
            return dropdowns;
        });


        for (const selector in dropdowns) {
            let value = dropdowns[selector];
            await page.select(selector, value);
            await wait(5000);
        }

        // Set Personalization
        if (isExists(page, "#listing-page-personalization-textarea"))
            await page.type('#listing-page-personalization-textarea', personalization, { delay: 100 });


        try {
            await page.click('[data-selector="add-to-cart-button"] button');
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        } catch (e) { }

        //#endregion Add To Cart 



        //#endregion Perform Steps

    }

    break;
    //#region Last Step

    let page = await browser.newPage();

    await page.goto(LAST_STEP_LISTING, PAGE_OPTIONS);
    //#endregion Last Step 


    await CloseBrowser(PROFILE_ID);
    await DeleteProfile(PROFILE_ID);

    console.log(`Waiting ${process.env.SESSION_WAIT}min`);
    await wait((process.env.SESSION_WAIT * 1000) * 60) // Waiting
    console.log(`Starting Again...`);

}