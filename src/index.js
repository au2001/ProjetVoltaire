const https = require("https");

const TRAINING = false;

function encodeParams(params) {
    return Object.entries(params).map(keyValue => keyValue.map(encodeURIComponent).join("=")).join("&");
}

async function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

async function checkLoading() {
    do {
        await sleep(1000);
    } while (document.getElementsByClassName("loading").length > 0);
}

async function checkSentence(sentence) {
    return new Promise(resolve => {
        if (sentence.length === 0) {
            resolve({ error: null, data: { SolutionCor: { MapMotSolution: {} } } });
        }

        const data = encodeParams({
            FunctionName: "GetTextSolution",
            texteHTML: sentence
        });

        const request = https.request({
            hostname: "cors-anywhere.herokuapp.com",
            path: "/https://www.scribens.fr/X4/TextSolution_Servlet",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Content-Length": data.length,
                "Accept-Encoding": "identity"
            }
        }, (result) => {
            var response = "";

            result.on("data", (part) => {
                response += part;
            });

            result.on("end", () => {
                resolve({ error: null, data: JSON.parse(response) });
            });
        });

        request.on("error", (error) => {
            resolve({ error, data: null });
        });

        request.write(data);
        request.end();
    });
}

async function main() {
    if (TRAINING) {
        const quit = document.getElementById("btn_apprentissage_sortir");
        if (quit !== null) {
            quit.click();
            await checkLoading();
        }

        const tabs = document.querySelectorAll(".home-product-selector .productTab:not(.disabled)");
        const tab = tabs[tabs.length - 1];
        tab.click();

        await checkLoading();

        const activities = document.querySelectorAll(".activity-selector-list .activity-selector-cell:not(.disabled)");
        const activity = activities[activities.length - 1];
        activity.click();

        await checkLoading();
    }

    while (true) {
        var sentence;
        do {
            await sleep(300);
            sentence = document.getElementsByClassName("sentence")[0];
        } while (sentence === null);
        const sentenceText = sentence.innerText;

        const result = await checkSentence(sentenceText);
        if (result.error)
            throw result.error;

        if (Object.keys(result.data.SolutionCor.MapMotSolution).length === 0) {
            const noErrorButton = document.getElementById("btn_pas_de_faute");
            noErrorButton.click();
        } else {
            const solution = result.data.SolutionCor.MapMotSolution[Object.keys(result.data.SolutionCor.MapMotSolution)[0]];
            console.log(solution); // TODO
        }

        await checkLoading();

        const nextQuestionButton = document.getElementById("btn_question_suivante");
        if (nextQuestionButton !== null) {
            nextQuestionButton.click();
            await checkLoading();
        }
    }
};

main();
