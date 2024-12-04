import axios from "axios";
import 'dotenv/config';
// Wait Fn
const wait = (ms) => new Promise((res, rej) => setTimeout(res, ms));

// Get Random Number Between
function between(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}
// Merge Path
function mergePath(...paths) {
    let url = '';
    paths.forEach(path => {
        path = trim(path);
        path = trim(path, '/');
        if (path.length) url += `/${path}`;
    });
    url = trim(url, '/');
    return url;
}
// Trim
function trim(str, charlist) {
    let whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u200b', '\u2028', '\u2029', '\u3000'].join('')
    let l = 0
    let i = 0
    str += ''
    if (charlist) {
        whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
    }
    l = str.length
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i)
            break
        }
    }
    l = str.length
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1)
            break
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}

// API_URL
function ApiUrl(url) {
    return mergePath(process.env.API_URL, url);
}

//#region Scraper Functions

// Create Profile
function CreateProfile(data = {}) {
    return new Promise(async (res, rej) => {
        let { group_id, name } = data;

        try {
            let response = await axios.post(ApiUrl('user/create'), {
                name,
                proxyid: between(1, process.env.MAX_PROXIES),
                group_id
            });

            res(response.data.data.id);
        } catch (error) {
            console.log("Try Again Failed to make profile");
            res(false);
        }

    });

}

// Delete Profile
function DeleteProfile(id) {
    return new Promise(async (res, rej) => {

        for (let i = 0; i < 3; i++) {
            try {
                let response = await axios.post(ApiUrl('user/delete'), {
                    user_ids: [id],
                });
                response = response.data;
                if (response.msg == 'success') break;
            } catch (error) {
                continue;
            }
        }

        res(true);
    });
}

// Start Browser
function StartBrowser(profile_id) {
    return new Promise(async (res, rej) => {
        let puppeteer = false;

        for (let i = 0; i < 3; i++) {
            try {
                let response = await axios.get(ApiUrl(`browser/start?user_id=${profile_id}`));
                puppeteer = response.data.data.ws.puppeteer;
                break;
            } catch (error) {
                console.log("Failed to launch browser Trying to run again...");
            }
        }

        res(puppeteer);

    });
}
// Close Browser
function CloseBrowser(profile_id) {
    return new Promise(async (res, rej) => {
        await axios.get(ApiUrl(`browser/stop?user_id=${profile_id}`));
        res(true);
    });
}

// Is Exists
function isExists(page, selector) {
    return new Promise(async (res, rej) => {
        let exists = await page.$(selector);
        res(exists);
    });

}

//#endregion Scraper Functions 

export {
    wait,
    between,
    mergePath,
    trim,
    CreateProfile, // Create Profile
    DeleteProfile, // Delete Profile
    StartBrowser, // Start Browser From Profile
    CloseBrowser,
    isExists
};