import axios from "axios";
const API_URL = 'http://local.adspower.net:50325/api/v1/';


// Create Profile
function CreateProfile(data = {}) {
    return new Promise(async (res, rej) => {
        let { group_id, name, domain_name = '', proxyid = 'random' } = data;

        try {
            let response = await axios.post(`${API_URL}user/create`, {
                name,
                domain_name,
                proxyid,
                group_id
            });
            res(response.data.data.id);
        } catch (error) {
            console.log("Try Again Failed to make profile");

            res(false);
        }

    });

}

// Start Browser
function startBrowser(profile_id) {
    return new Promise(async (res, rej) => {
        try {
            let response = await axios.get(`${API_URL}browser/start?user_id=${profile_id}`);
            res(response.data.data.ws.puppeteer);
        } catch (error) {
            console.log("Try Again Failed to launch browser");
            res(false);
        }
    });
}
export {
    CreateProfile,
    startBrowser
};
